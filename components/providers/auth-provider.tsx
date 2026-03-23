"use client"

import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Optionally show a loading state during initialization
  // For now, we render children immediately for better UX
  return <>{children}</>
}
