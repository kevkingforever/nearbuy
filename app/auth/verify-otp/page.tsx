"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { StatusBar } from "@/components/layout/mobile-shell"
import { apiClient } from "@/lib/api/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { ArrowLeft } from "lucide-react"
import { formatPhoneNumber } from "@/lib/utils"

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""
  const isVendorFlow = searchParams.get("vendor") === "true"
  const isLogin = searchParams.get("login") === "true"
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (otpCode: string) => {
    if (isLoading) return
    setIsLoading(true)

    try {
      let response
      if (isLogin) {
        response = await apiClient.verifyPhoneLogin(phone, otpCode)
      } else {
        response = await apiClient.verifyPhoneRegistration(
          phone, 
          otpCode, 
          isVendorFlow ? "VENDOR" : "BUYER"
        )
      }

      if (response.success && response.data) {
        setTokens(response.data.accessToken, response.data.refreshToken)
        
        // Fetch user data
        const userResponse = await apiClient.getCurrentUser()
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }
        
        toast.success(`Welcome to NearBuy!`)
        
        if (isVendorFlow) {
          router.push("/vendor/setup")
        } else {
          router.push("/")
        }
      } else {
        toast.error(response.message || "Invalid code")
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verification failed"
      toast.error(message)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    try {
      if (isLogin) {
        await apiClient.requestPhoneOtpForLogin(phone)
      } else {
        await apiClient.requestPhoneOtpForRegister(phone)
      }
      toast.success("New code sent")
      setCountdown(600)
      setCanResend(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to resend code"
      toast.error(message)
    }
  }

  const handleNumpadClick = (num: string) => {
    const emptyIndex = otp.findIndex((d) => d === "")
    if (emptyIndex !== -1) {
      handleOtpChange(emptyIndex, num)
    }
  }

  const handleNumpadDelete = () => {
    const lastFilledIndex = otp.map((d, i) => (d !== "" ? i : -1)).filter((i) => i !== -1).pop()
    if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
      const newOtp = [...otp]
      newOtp[lastFilledIndex] = ""
      setOtp(newOtp)
      inputRefs.current[lastFilledIndex]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <StatusBar variant="dark" />
      
      <div className="flex-1 flex flex-col px-6 py-7 overflow-auto">
        {/* Back Button */}
        <Link 
          href={isLogin ? "/auth/login" : "/auth/register"}
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center mb-8 flex-shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,.1)" }}
        >
          <ArrowLeft className="w-[18px] h-[18px] text-white" />
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-bold text-white/35 tracking-[1.5px] mb-2.5">
            STEP 2 OF 2
          </div>
          <h1 className="font-serif text-[28px] text-white font-bold leading-[1.2] mb-2">
            Enter the<br/>6-digit code
          </h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Sent to {formatPhoneNumber(phone)} · Expires in{" "}
            <span className="text-[#4ade80]">{formatTime(countdown)}</span>
          </p>
        </div>

        {/* OTP Boxes */}
        <div className="flex gap-2 justify-center mb-7" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-box w-[52px] h-[60px] text-center text-2xl font-black transition-colors focus:outline-none"
              style={{
                borderColor: digit ? "var(--g)" : "var(--border)",
                color: digit ? "var(--g)" : "var(--ink)",
              }}
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => (
            <button
              key={key || "empty"}
              onClick={() => {
                if (key === "del") handleNumpadDelete()
                else if (key) handleNumpadClick(key)
              }}
              disabled={!key}
              className="py-4 rounded-md text-xl font-bold text-white transition-colors disabled:opacity-0"
              style={{ background: key ? "rgba(255,255,255,.08)" : "transparent" }}
            >
              {key === "del" ? "⌫" : key}
            </button>
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify(otp.join(""))}
          disabled={isLoading || otp.some((d) => d === "")}
          className="w-full max-w-[280px] mx-auto bg-primary text-white rounded-md py-4 text-[15px] font-black transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? "Verifying..." : "Verify & Continue →"}
        </button>

        {/* Resend */}
        <div className="text-center mt-5">
          <button
            onClick={handleResend}
            disabled={!canResend}
            className="text-[13px] font-bold transition-colors disabled:cursor-not-allowed"
            style={{ 
              background: "none", 
              border: "none",
              color: canResend ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.4)",
            }}
          >
            Didn&apos;t receive it? Resend code
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
