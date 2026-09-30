import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"

// Pre-hashed dummy for constant-time auth (prevents user enumeration via timing)
const DUMMY_HASH = bcrypt.hashSync("__dummy__", 10)

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: "jwt",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email }).select(
          "+hashedPassword"
        )

        // Constant-time: always run bcrypt even if user not found
        const hashToCompare =
          user?.hashedPassword ?? DUMMY_HASH
        const isValid = await bcrypt.compare(
          credentials.password as string,
          hashToCompare
        )
        if (!user?.hashedPassword || !isValid) return null

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Block Google OAuth linking to unverified credentials accounts
      if (account?.provider === "google" && user.email) {
        await connectDB()
        const existing = await User.findOne({ email: user.email })
        if (existing && !existing.emailVerified) {
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }

      // Allow updating activeWeddingId via session update
      if (trigger === "update" && session?.activeWeddingId) {
        token.activeWeddingId = session.activeWeddingId
      }

      // Invalidate JWT if password was changed after token was issued
      if (token.id && token.iat) {
        await connectDB()
        const dbUser = await User.findById(token.id).select("passwordChangedAt").lean()
        if (dbUser?.passwordChangedAt) {
          const changedAtSec = Math.floor(dbUser.passwordChangedAt.getTime() / 1000)
          if (changedAtSec > (token.iat as number)) {
            return {} as typeof token
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { activeWeddingId?: string }).activeWeddingId =
          token.activeWeddingId as string | undefined
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
})
