"use client"

import { useState, useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"

function getStrength(val: string) {
  if (!val) return 0
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  return score
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"]
const STRENGTH_COLORS = ["", "bg-[#C8A26B]/50", "bg-[#C8A26B]/70", "bg-[#C8A26B]", "bg-[#1E293B]"]

export function PasswordInput({
  id,
  name,
  placeholder = "Min. 8 characters",
  showStrength = false,
  required = true,
  value,
  onChange,
}: {
  id: string
  name: string
  placeholder?: string
  showStrength?: boolean
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [visible, setVisible] = useState(false)
  const [internal, setInternal] = useState("")
  const val = value ?? internal
  const strength = useMemo(() => getStrength(val), [val])

  return (
    <div>
      <div className="relative flex items-center">
        <input
          className="w-full h-11 px-3.5 pr-11 bg-white border border-[#D2C4B6]/60 rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#AAA8A8] focus:outline-none focus:border-[#C8A26B] focus:ring-2 focus:ring-[#C8A26B]/20 transition"
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          value={val}
          onChange={onChange ?? ((e) => setInternal(e.target.value))}
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-[#5F5E5E] hover:text-[#1A1A1A] transition-colors"
          onClick={() => setVisible(!visible)}
          aria-label="Toggle password visibility"
        >
          {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {showStrength && (
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                  strength >= i ? STRENGTH_COLORS[strength] : "bg-[#EEEEEC]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-xs ${strength >= 4 ? "text-[#1E293B] font-semibold" : strength >= 1 ? "text-[#775929]" : "text-[#5F5E5E]"}`}>
              {val ? STRENGTH_LABELS[strength] || "Too short" : "Strength: Min. 8 characters"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
