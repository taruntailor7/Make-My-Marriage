import Link from "next/link"
import type { Metadata } from "next"
import { BrandPanel, MobileBrandBar } from "@/components/auth/brand-panel"
import { GoogleButton } from "@/components/auth/google-button"
import { SignupForm } from "./form"

export const metadata: Metadata = {
  title: "Sign Up — Make My Marriage",
}

export default function SignupPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <MobileBrandBar />
      <div className="flex flex-1 flex-col lg:flex-row">
        <BrandPanel />

        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-[420px] py-4">
            <div className="mb-8">
              <h2 className="font-serif text-[32px] leading-tight font-bold text-[#1A1A1A] tracking-tight mb-2">
                Create your account
              </h2>
              <p className="text-base text-[#4E453A]">Start planning your celebration in minutes.</p>
            </div>

            <GoogleButton />

            <div className="relative my-7 flex items-center justify-center">
              <div className="w-full border-t border-[#D2C4B6]/40" />
              <span className="absolute bg-white px-3 text-xs text-[#5F5E5E] uppercase tracking-wider">
                or continue with email
              </span>
            </div>

            <SignupForm />

            <p className="text-xs text-[#4E453A] text-center mt-5 leading-normal">
              By signing up, you agree to our{" "}
              <a href="#" className="text-[#C8A26B] hover:underline font-medium">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-[#C8A26B] hover:underline font-medium">Privacy Policy</a>.
            </p>

            <div className="mt-8 pt-6 border-t border-[#EEEEEC] text-center">
              <p className="text-sm text-[#4E453A]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#C8A26B] font-semibold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
