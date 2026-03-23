"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileShellProps {
  children: ReactNode
  className?: string
  showStatusBar?: boolean
  statusBarVariant?: "light" | "dark" | "transparent"
}

export function MobileShell({
  children,
  className,
  showStatusBar = true,
  statusBarVariant = "light",
}: MobileShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      {showStatusBar && <StatusBar variant={statusBarVariant} />}
      {children}
    </div>
  )
}

interface StatusBarProps {
  variant?: "light" | "dark" | "transparent"
}

export function StatusBar({ variant = "light" }: StatusBarProps) {
  const bgClass = {
    light: "bg-card",
    dark: "bg-ink",
    transparent: "bg-transparent absolute top-0 left-0 right-0",
  }[variant]

  const textClass = {
    light: "text-ink",
    dark: "text-white/80",
    transparent: "text-white/90",
  }[variant]

  const subtextClass = {
    light: "text-ink-3",
    dark: "text-white/40",
    transparent: "text-white/90",
  }[variant]

  return (
    <div
      className={cn(
        "h-[52px] flex items-end justify-between px-7 pb-2.5 flex-shrink-0 relative z-50",
        bgClass
      )}
    >
      <span className={cn("text-[15px] font-extrabold tracking-tight", textClass)}>
        9:41
      </span>
      <span className={cn("text-[11px]", subtextClass)}>
        <span className="mr-1">{"▲▲"}</span>
        <span>{"🔋"}</span>
      </span>
      {/* Dynamic Island notch */}
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[36px] rounded-b-3xl",
          variant === "transparent" ? "bg-black/30" : bgClass
        )}
      />
    </div>
  )
}
