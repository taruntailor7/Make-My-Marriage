"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { PasswordInput } from "@/components/auth/password-input"
import { resetPasswordAction } from "@/lib/actions/auth"
import { resetPasswordSchema } from "@/lib/validations/auth.schema"

export function ResetPasswordCard() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  if (!token) {
    return (
      <div className="w-full max-w-[460px] bg-white rounded-xl p-8 sm:p-10 shadow-md text-center">
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-[#FFDAD6] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#BA1A1A]" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-3">
          Invalid or expired link
        </h2>
        <p className="text-sm text-[#5F5E5E] mb-6">
          This password reset link is missing or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="w-full h-12 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          Request New Link <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full max-w-[460px] bg-white rounded-xl p-8 sm:p-10 shadow-md text-center">
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-[#F4F4F2] flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-[#C8A26B]" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-3">
          Password updated
        </h2>
        <p className="text-sm text-[#5F5E5E] mb-6">
          Your password has been reset. You can now log in with your new credentials.
        </p>
        <Link
          href="/login"
          className="w-full h-12 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    const parsed = resetPasswordSchema.safeParse({ token, newPassword: password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setLoading(true)
    const result = await resetPasswordAction(parsed.data)
    setLoading(false)

    if (result?.serverError) {
      setError(result.serverError)
      return
    }

    setDone(true)
  }

  return (
    <div className="w-full max-w-[460px] bg-white rounded-xl p-8 sm:p-10 shadow-md">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-2">
          Set a new password
        </h1>
        <p className="text-sm text-[#5F5E5E]">Choose a strong password for your account.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-lg bg-[#FFDAD6] text-[#93000A] text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            New Password
          </label>
          <PasswordInput
            id="new-password"
            name="newPassword"
            showStrength
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Confirm Password
          </label>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError("") }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-semibold rounded-lg mt-4 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? "Resetting..." : (
            <>Reset Password <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}
