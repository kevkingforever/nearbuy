"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CurrentUserResponse, UserRole } from "@/lib/api/types"
import { apiClient } from "@/lib/api/client"

interface AuthState {
  isAuthenticated: boolean
  user: CurrentUserResponse | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  
  // Location state (for unauthenticated users)
  currentCity: string
  currentLat: number
  currentLng: number
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: CurrentUserResponse | null) => void
  setLocation: (city: string, lat: number, lng: number) => void
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,
      
      // Default to Accra, Ghana
      currentCity: "Accra",
      currentLat: 5.6037,
      currentLng: -0.187,

      setTokens: (accessToken: string, refreshToken: string) => {
        apiClient.setAccessToken(accessToken)
        set({ 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        })
      },

      setUser: (user: CurrentUserResponse | null) => {
        set({ user })
        if (user?.location) {
          set({
            currentCity: user.location.city,
            currentLat: user.location.latitude,
            currentLng: user.location.longitude,
          })
        }
      },

      setLocation: (city: string, lat: number, lng: number) => {
        set({ currentCity: city, currentLat: lat, currentLng: lng })
      },

      logout: async () => {
        const { refreshToken } = get()
        if (refreshToken) {
          try {
            await apiClient.logout(refreshToken)
          } catch (e) {
            // Ignore logout errors
          }
        }
        apiClient.setAccessToken(null)
        set({ 
          isAuthenticated: false, 
          user: null, 
          accessToken: null, 
          refreshToken: null 
        })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        
        try {
          const response = await apiClient.refreshToken(refreshToken)
          if (response.success && response.data) {
            apiClient.setAccessToken(response.data.accessToken)
            set({ accessToken: response.data.accessToken })
            return true
          }
          return false
        } catch (e) {
          // Refresh failed, logout
          await get().logout()
          return false
        }
      },

      initialize: async () => {
        const { accessToken, refreshToken } = get()
        
        if (!accessToken || !refreshToken) {
          set({ isLoading: false })
          return
        }
        
        apiClient.setAccessToken(accessToken)
        
        try {
          const response = await apiClient.getCurrentUser()
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true,
              isLoading: false 
            })
            if (response.data.location) {
              set({
                currentCity: response.data.location.city,
                currentLat: response.data.location.latitude,
                currentLng: response.data.location.longitude,
              })
            }
          }
        } catch (e) {
          // Token might be expired, try to refresh
          const refreshed = await get().refreshAccessToken()
          if (refreshed) {
            try {
              const response = await apiClient.getCurrentUser()
              if (response.success && response.data) {
                set({ 
                  user: response.data, 
                  isAuthenticated: true 
                })
              }
            } catch (e2) {
              await get().logout()
            }
          }
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "nearbuy-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        currentCity: state.currentCity,
        currentLat: state.currentLat,
        currentLng: state.currentLng,
      }),
    }
  )
)

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsVendor = () => useAuthStore((state) => state.user?.role === "VENDOR")
export const useCurrentLocation = () => useAuthStore((state) => ({
  city: state.currentCity,
  lat: state.currentLat,
  lng: state.currentLng,
}))
