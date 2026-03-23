"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api/client"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error
      const error = searchParams.get("error")
      if (error) {
        const message = searchParams.get("message") || "Authentication failed"
        toast.error(message)
        router.push("/")
        return
      }

      // Check for success params
      const accessToken = searchParams.get("accessToken")
      const refreshToken = searchParams.get("refreshToken")
      const userId = searchParams.get("userId")
      const role = searchParams.get("role")

      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken)
        
        // Fetch user data
        try {
          const userResponse = await apiClient.getCurrentUser()
          if (userResponse.success && userResponse.data) {
            setUser(userResponse.data)
          }
        } catch (e) {
          // User data will be fetched on next page load
        }

        toast.success("Welcome to NearBuy!")
        
        if (role === "VENDOR") {
          router.push("/vendor")
        } else {
          router.push("/")
        }
      } else {
        toast.error("Authentication failed")
        router.push("/")
      }
    }

    handleCallback()
  }, [searchParams, router, setTokens, setUser])

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#fff" strokeWidth="2" fill="none"/>
            <circle cx="18" cy="18" r="4" fill="#fff"/>
          </svg>
        </div>
        <p className="text-white/60 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
