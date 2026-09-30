"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowRight, Info } from "lucide-react"
import { PasswordInput } from "@/components/auth/password-input"
import { signUpAction } from "@/lib/actions/auth"
import { signUpSchema } from "@/lib/validations/auth.schema"

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    const parsed = signUpSchema.safeParse({ name, email, password, phone: phone || undefined })
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors[field] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    const result = await signUpAction(parsed.data)

    if (result?.serverError) {
      setError(result.serverError)
      setLoading(false)
      return
    }

    // Auto sign in after successful signup
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (signInResult?.error) {
      // Account created but auto-login failed — redirect to login
      router.push("/login")
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
        <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Riya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3.5 bg-white border border-[#D2C4B6]/60 rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#AAA8A8] focus:outline-none focus:border-[#C8A26B] focus:ring-2 focus:ring-[#C8A26B]/20 transition"
        />
        {fieldErrors.name && <p className="text-xs text-[#BA1A1A] mt-1">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-3.5 bg-white border border-[#D2C4B6]/60 rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#AAA8A8] focus:outline-none focus:border-[#C8A26B] focus:ring-2 focus:ring-[#C8A26B]/20 transition"
        />
        {fieldErrors.email && <p className="text-xs text-[#BA1A1A] mt-1">{fieldErrors.email}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="phone" className="block text-sm font-medium text-[#1A1A1A]">Phone</label>
          <span className="text-xs text-[#5F5E5E]">Optional</span>
        </div>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-11 px-3.5 bg-white border border-[#D2C4B6]/60 rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#AAA8A8] focus:outline-none focus:border-[#C8A26B] focus:ring-2 focus:ring-[#C8A26B]/20 transition"
        />
        <p className="text-xs text-[#4E453A] mt-1.5 flex items-center gap-1">
          <Info className="w-3 h-3 text-[#5F5E5E]" />
          For guest communication & team updates — we won&apos;t spam you.
        </p>
        {fieldErrors.phone && <p className="text-xs text-[#BA1A1A] mt-1">{fieldErrors.phone}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Password</label>
        <PasswordInput
          id="password"
          name="password"
          showStrength
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && <p className="text-xs text-[#BA1A1A] mt-1">{fieldErrors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-semibold rounded-lg mt-6 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? "Creating account..." : (
          <>Create Account <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  )
}
