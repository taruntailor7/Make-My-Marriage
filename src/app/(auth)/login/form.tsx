"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { PasswordInput } from "@/components/auth/password-input"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 rounded-lg bg-[#FFDAD6] text-[#93000A] text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded-lg bg-white text-[#1A1A1A] placeholder:text-[#D2C4B6] text-sm shadow-sm outline-none focus:shadow-md transition"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-[#C8A26B] font-medium hover:text-[#775929] transition-colors">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#C8A26B] cursor-pointer" />
          <span className="text-xs text-[#4E453A]">Remember this device</span>
        </label>
        <span className="flex items-center gap-1 text-xs text-[#5F5E5E]">
          <Lock className="w-3 h-3" />
          256-bit Encrypted
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? "Authenticating..." : (
          <>Log In to Workspace <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  )
}
