export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#2F3130] text-[#FAFAF8] relative flex-col justify-between p-12 lg:p-16 overflow-hidden select-none" aria-hidden="true">
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C8A26B]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#775929]/15 blur-2xl pointer-events-none" />

      {/* Top: Brand */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#775929] to-[#C8A26B] flex items-center justify-center shadow-md">
            <div className="w-6 h-6 rounded-full bg-[#2F3130] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#C8A26B]" />
            </div>
          </div>
          <span className="text-lg font-semibold tracking-tight">Make My Marriage</span>
        </div>
      </div>

      {/* Center: Hero text */}
      <div className="relative z-10 max-w-md my-auto py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-xs text-[#E9C086] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A26B]" />
          Executive Planning Suite
        </div>
        <h1 className="font-serif text-[32px] leading-tight font-bold tracking-tight">
          Your entire wedding. <br />
          <span className="text-[#E9C086] italic">One decisive canvas.</span>
        </h1>
        <p className="text-base text-[#C8C6C5] mt-4 leading-relaxed">
          The purposeful operating system orchestrating venues, budgets, guest tiers, and vendor contracts with zero friction.
        </p>
        <div className="w-16 h-[2px] bg-[#C8A26B] my-8 rounded-full" />
        <div className="space-y-3">
          <p className="text-sm text-[#C8C6C5] italic leading-relaxed">
            &ldquo;Finally, a wedding tool that doesn&apos;t look like a wedding tool. It feels as rigorous as our investment portfolio tracker.&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-[#E2E3E1]/20 flex items-center justify-center text-xs font-medium">
              D
            </div>
            <div>
              <p className="text-sm font-semibold">Devika & Sameer</p>
              <p className="text-xs text-[#C8C6C5]">Oberoi Udaivilas, Udaipur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Trust */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} className="w-3.5 h-3.5 text-[#C8A26B] fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-[#C8C6C5] ml-1">Early Access</span>
        </div>
      </div>
    </div>
  )
}

export function MobileBrandBar() {
  return (
    <div className="lg:hidden w-full bg-[#2F3130] text-[#FAFAF8] py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#C8A26B] inline-block" />
        <span className="text-base font-semibold tracking-tight">Make My Marriage</span>
      </div>
    </div>
  )
}
