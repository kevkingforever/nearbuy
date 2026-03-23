"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { StatusBar } from "@/components/layout/mobile-shell"
import { apiClient } from "@/lib/api/client"
import { ArrowLeft } from "lucide-react"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isVendorFlow = searchParams.get("vendor") === "true"
  
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatPhoneInput = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "")
    // Format as XXX XXX XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 9) {
      toast.error("Please enter a valid phone number")
      return
    }

    // Format to E.164
    const e164Phone = digits.startsWith("0") 
      ? `+233${digits.slice(1)}` 
      : `+233${digits}`

    setIsLoading(true)
    
    try {
      const response = await apiClient.requestPhoneOtpForRegister(e164Phone)
      if (response.success) {
        toast.success("Code sent to your phone")
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(e164Phone)}${isVendorFlow ? "&vendor=true" : ""}`)
      } else {
        toast.error(response.message || "Failed to send code")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send code"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <StatusBar variant="dark" />
      
      <div className="flex-1 flex flex-col px-6 py-7 overflow-auto">
        {/* Back Button */}
        <Link 
          href="/"
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center mb-8 flex-shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,.1)" }}
        >
          <ArrowLeft className="w-[18px] h-[18px] text-white" />
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-bold text-white/35 tracking-[1.5px] mb-2.5">
            STEP 1 OF 2
          </div>
          <h1 className="font-serif text-[28px] text-white font-bold leading-[1.2] mb-2">
            Your phone<br/>number
          </h1>
          <p className="text-sm text-white/40 leading-relaxed">
            We&apos;ll send a 6-digit code. No Ghana Card needed to start browsing.
          </p>
        </div>

        {/* Phone Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex gap-2.5 items-center">
              {/* Country Code */}
              <div 
                className="flex items-center gap-2 px-4 py-3.5 rounded-md flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1.5px solid rgba(255,255,255,.15)",
                }}
              >
                <span className="text-lg">🇬🇭</span>
                <span className="text-sm font-extrabold text-white">+233</span>
              </div>
              
              {/* Phone Input */}
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="024 000 0000"
                className="flex-1 px-4 py-3.5 rounded-md text-base font-bold text-white outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1.5px solid rgba(255,255,255,.15)",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(74,222,128,.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,.15)"}
                maxLength={12}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white rounded-md py-4 text-[15px] font-black transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? "Sending..." : "Send Code →"}
          </button>
        </form>

        {/* Terms */}
        <div className="text-center mt-5">
          <p className="text-xs text-white/25 leading-relaxed">
            By continuing you agree to NearBuy&apos;s Terms of Service.<br/>
            Your data is protected under the Ghana Data Protection Act 2012.
          </p>
        </div>

        {/* Sign In Link */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-[13px] text-white/35 mb-3">Already have an account?</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-full text-[13px] font-extrabold transition-colors"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,.2)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
