export function AuthCenterHeader() {
  return (
    <header className="flex flex-col items-center mb-8 text-center">
      <div className="w-10 h-10 rounded-full bg-white shadow-sm mb-3 flex items-center justify-center">
        <span className="font-serif text-lg font-bold text-[#C8A26B]">M</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">Make My Marriage</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A26B]" />
      </div>
    </header>
  )
}
