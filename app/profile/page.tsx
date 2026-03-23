"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  User, ChevronRight, Package, Heart, MapPin, CreditCard, Bell, 
  HelpCircle, Shield, LogOut, Store, Settings, Star, BadgeCheck,
  Wallet, FileText, Moon, Sun
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { MobileShell } from "@/components/layout/mobile-shell"
import { api } from "@/lib/api/client"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isVendor } = useAuthStore()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      logout()
      router.push("/")
    }
  }

  const menuSections = [
    {
      title: "My Activity",
      items: [
        { icon: Package, label: "My Orders", href: "/orders", badge: user?.pendingOrders },
        { icon: Heart, label: "Saved Items", href: "/saved" },
        { icon: Star, label: "My Reviews", href: "/reviews" },
      ]
    },
    {
      title: "Account Settings",
      items: [
        { icon: User, label: "Edit Profile", href: "/profile/edit" },
        { icon: MapPin, label: "Addresses", href: "/addresses" },
        { icon: CreditCard, label: "Payment Methods", href: "/payment-methods" },
        { icon: Bell, label: "Notifications", href: "/notifications/settings" },
      ]
    },
    {
      title: "Vendor",
      items: isVendor 
        ? [{ icon: Store, label: "Vendor Dashboard", href: "/vendor/dashboard" }]
        : [{ icon: Store, label: "Become a Vendor", href: "/vendor/setup" }]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", href: "/help" },
        { icon: Shield, label: "Privacy & Security", href: "/privacy" },
        { icon: FileText, label: "Terms of Service", href: "/terms" },
      ]
    }
  ]

  if (!user) return null

  return (
    <MobileShell>
      <div className="pb-8">
        {/* Header */}
        <div className="bg-primary px-4 pt-8 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-primary-foreground">Profile</h1>
              <button 
                onClick={() => router.push("/settings")}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
              >
                <Settings className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="bg-card rounded-2xl p-4 shadow-lg border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.fullName}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">{user.fullName}</h2>
                <p className="text-sm text-muted-foreground truncate">{user.email || user.phone}</p>
                {isVendor && (
                  <div className="flex items-center gap-1 mt-1">
                    <Store className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">Vendor Account</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <button 
                onClick={() => router.push("/orders")}
                className="text-center"
              >
                <p className="text-lg font-semibold">{user.totalOrders || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </button>
              <button 
                onClick={() => router.push("/saved")}
                className="text-center"
              >
                <p className="text-lg font-semibold">{user.savedItems || 0}</p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </button>
              <button 
                onClick={() => router.push("/wallet")}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <Wallet className="w-4 h-4 text-primary" />
                  <p className="text-lg font-semibold">{user.walletBalance || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground">Wallet</p>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="px-4 mt-6 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {section.title}
              </h3>
              <div className="bg-card rounded-xl border overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                      index > 0 ? "border-t" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Theme Toggle */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 text-left font-medium">Dark Mode</span>
              <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted"}`}>
                <div className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform m-0.5 ${darkMode ? "translate-x-6" : ""}`} />
              </div>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-xl border hover:bg-muted/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="flex-1 text-left font-medium text-red-600 dark:text-red-400">Logout</span>
          </button>

          {/* App Version */}
          <p className="text-center text-xs text-muted-foreground py-4">
            NearBuy v1.0.0
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
