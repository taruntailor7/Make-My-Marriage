"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Send, Mail } from "lucide-react"
import { forgotPasswordAction } from "@/lib/actions/auth"
import { forgotPasswordSchema } from "@/lib/validations/auth.schema"

export function ForgotPasswordCard() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    const result = await forgotPasswordAction(parsed.data)
    setLoading(false)

    if (result?.serverError) {
      setError(result.serverError)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-[460px] bg-white rounded-xl p-8 sm:p-10 shadow-md text-center">
        <div className="relative mx-auto w-16 h-16 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C8A26B]/20 animate-ping opacity-25" />
          <div className="relative w-16 h-16 rounded-full bg-[#F4F4F2] flex items-center justify-center shadow-sm">
            <Send className="w-8 h-8 text-[#C8A26B]" />
          </div>
        </div>

        <span className="inline-block px-3 py-1 mb-3 rounded-full bg-[#D5E0F8] text-xs font-medium text-[#545F73]">
          Instructions Sent
        </span>
        <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-3">
          Check your email
        </h2>
        <p className="text-sm text-[#5F5E5E] mb-6 leading-relaxed">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-[#1A1A1A] underline decoration-[#C8A26B] decoration-2 underline-offset-4">
            {email}
          </span>
          . It expires in 1 hour.
        </p>

        <div className="space-y-3 mb-6">
          <Link
            href="/login"
            className="w-full h-12 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Back to Login
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full h-12 bg-[#F4F4F2] hover:bg-[#E8E8E6] text-[#1A1A1A] text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center"
          >
            Try a different email
          </button>
        </div>

        <p className="text-xs text-[#5F5E5E]">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-[#C8A26B] font-medium underline underline-offset-2 hover:text-[#775929]"
          >
            Resend
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[460px] bg-white rounded-xl p-8 sm:p-10 shadow-md">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#5F5E5E] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-[#5F5E5E]">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-lg bg-[#FFDAD6] text-[#93000A] text-sm">
            {error}
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A]">
              Email Address
            </label>
            <span className="text-xs text-[#5F5E5E]">Required</span>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-white text-[#1A1A1A] placeholder:text-[#AAA8A8] text-sm shadow-sm outline-none focus:bg-[#F4F4F2] transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#C8A26B] hover:bg-[#775929] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? "Sending..." : (
            <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}
