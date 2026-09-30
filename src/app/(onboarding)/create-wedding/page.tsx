import type { Metadata } from "next"
import { CreateWeddingWizard } from "./wizard"

export const metadata: Metadata = {
  title: "Create Wedding — Make My Marriage",
}

export default function CreateWeddingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <header className="w-full h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C8A26B]" />
          <span className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">Make My Marriage</span>
        </div>
      </header>
      <main className="flex-1 w-full">
        <CreateWeddingWizard />
      </main>
    </div>
  )
}
