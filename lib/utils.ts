import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: string | number, currency = "GHS"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return `${currency} ${num.toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export function formatPhoneNumber(phone: string): string {
  // Format Ghanaian phone numbers
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith("233")) {
    return `+233 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date()
  const d = typeof date === "string" ? new Date(date) : date
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
