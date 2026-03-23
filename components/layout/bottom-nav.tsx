"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Search, MessageCircle, Package, Plus } from "lucide-react"
import { useIsVendor } from "@/lib/stores/auth-store"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

const buyerNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Home className="w-[22px] h-[22px]" /> },
  { href: "/browse", label: "Browse", icon: <Search className="w-[22px] h-[22px]" /> },
  { href: "/chat", label: "Chat", icon: <MessageCircle className="w-[22px] h-[22px]" /> },
  { href: "/orders", label: "Orders", icon: <Package className="w-[22px] h-[22px]" /> },
]

const vendorNavItems: NavItem[] = [
  { href: "/vendor", label: "Dashboard", icon: <Home className="w-[22px] h-[22px]" /> },
  { href: "/vendor/listings", label: "Listings", icon: <Package className="w-[22px] h-[22px]" /> },
  { href: "/chat", label: "Chat", icon: <MessageCircle className="w-[22px] h-[22px]" /> },
  { href: "/vendor/orders", label: "Orders", icon: <Package className="w-[22px] h-[22px]" /> },
]

export function BottomNav() {
  const pathname = usePathname()
  const isVendor = useIsVendor()
  
  const navItems = isVendor ? vendorNavItems : buyerNavItems
  const addHref = isVendor ? "/vendor/listings/new" : "/browse"

  // Don't show on auth pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding")) {
    return null
  }

  return (
    <nav className="bottom-nav safe-area-pb">
      {navItems.slice(0, 2).map((item) => (
        <NavButton key={item.href} item={item} isActive={pathname === item.href} />
      ))}
      
      {/* Center Add Button */}
      <Link 
        href={addHref}
        className="bottom-nav-add"
        aria-label={isVendor ? "Add new listing" : "Browse products"}
      >
        <Plus className="w-6 h-6" />
      </Link>
      
      {navItems.slice(2).map((item) => (
        <NavButton key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + "/")} />
      ))}
    </nav>
  )
}

interface NavButtonProps {
  item: NavItem
  isActive: boolean
}

function NavButton({ item, isActive }: NavButtonProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        "bottom-nav-item",
        isActive && "active"
      )}
    >
      <span className={cn(
        "nav-icon transition-all duration-200",
        isActive && "scale-[1.15] text-primary drop-shadow-[0_0_4px_rgba(27,107,58,0.5)]"
      )}>
        {item.icon}
      </span>
      <span className={cn(
        "nav-label",
        isActive && "text-primary font-extrabold"
      )}>
        {item.label}
      </span>
    </Link>
  )
}
