import Link from "next/link"
import type { Metadata } from "next"
import { BrandPanel, MobileBrandBar } from "@/components/auth/brand-panel"
import { GoogleButton } from "@/components/auth/google-button"
import { LoginForm } from "./form"

export const metadata: Metadata = {
  title: "Log In — Make My Marriage",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <MobileBrandBar />
      <div className="flex flex-1 flex-col lg:flex-row">
        <BrandPanel />

        <div className="w-full lg:w-1/2 bg-[#FAFAF8] flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[410px]">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#C8A26B] font-semibold">Secure Portal</span>
              <h2 className="font-serif text-[32px] leading-tight font-bold text-[#1A1A1A] mt-2 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-[#4E453A] mt-1">Log in to continue orchestrating your celebrations.</p>
            </div>

            <GoogleButton />

            <div className="relative my-7 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[#E2E3E1]" />
              </div>
              <span className="relative px-3 bg-[#FAFAF8] text-[#5F5E5E] text-xs uppercase tracking-wider">
                or with email
              </span>
            </div>

            <LoginForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-[#5F5E5E]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#C8A26B] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 flex justify-center items-center gap-4 text-[#5F5E5E] text-xs">
              <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
