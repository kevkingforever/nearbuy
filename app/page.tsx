"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { OnboardingScreen } from "@/components/screens/onboarding-screen"
import { HomeScreen } from "@/components/screens/home-screen"

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#fff" strokeWidth="2" fill="none"/>
            <path d="M18 4L18 32M4 12L32 12M4 24L32 24" stroke="#fff" strokeWidth="1.5" opacity=".4"/>
            <circle cx="18" cy="18" r="4" fill="#fff"/>
          </svg>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <OnboardingScreen />
  }

  return <HomeScreen />
}
