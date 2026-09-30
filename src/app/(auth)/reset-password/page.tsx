import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCenterHeader } from "@/components/auth/center-header"
import { ResetPasswordCard } from "./form"

export const metadata: Metadata = {
  title: "Set New Password — Make My Marriage",
}

export default function ResetPasswordPage() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 bg-[#FAFAF8]">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[580px] h-[580px] bg-[#C8A26B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <AuthCenterHeader />
      <Suspense fallback={<div className="w-full max-w-[460px] h-96 bg-white rounded-xl shadow-md animate-pulse" />}>
        <ResetPasswordCard />
      </Suspense>
    </div>
  )
}
