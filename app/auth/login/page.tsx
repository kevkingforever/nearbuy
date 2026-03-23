"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { StatusBar } from "@/components/layout/mobile-shell"
import { apiClient } from "@/lib/api/client"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "")
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

    const e164Phone = digits.startsWith("0") 
      ? `+233${digits.slice(1)}` 
      : `+233${digits}`

    setIsLoading(true)
    
    try {
      const response = await apiClient.requestPhoneOtpForLogin(e164Phone)
      if (response.success) {
        toast.success("Code sent to your phone")
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(e164Phone)}&login=true`)
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
          <h1 className="font-serif text-[28px] text-white font-bold leading-[1.2] mb-2">
            Welcome<br/>back
          </h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Enter your phone number to sign in to your account.
          </p>
        </div>

        {/* Phone Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex gap-2.5 items-center">
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

        {/* Create Account Link */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-[13px] text-white/35 mb-3">Don&apos;t have an account?</p>
          <Link
            href="/auth/register"
            className="inline-block px-6 py-2.5 rounded-full text-[13px] font-extrabold transition-colors"
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,.2)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
