import type { Metadata } from "next"
import { AuthCenterHeader } from "@/components/auth/center-header"
import { ForgotPasswordCard } from "./form"

export const metadata: Metadata = {
  title: "Reset Password — Make My Marriage",
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 bg-[#FAFAF8]">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[580px] h-[580px] bg-[#C8A26B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <AuthCenterHeader />
      <ForgotPasswordCard />

      <div className="mt-8 text-center text-xs text-[#5F5E5E]">
        Need help?{" "}
        <a href="mailto:hello@makemymarriage.com" className="text-[#1A1A1A] font-medium hover:underline">
          hello@makemymarriage.com
        </a>
      </div>
    </div>
  )
}
