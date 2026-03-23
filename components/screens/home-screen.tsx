"use client"

import Link from "next/link"
import useSWR from "swr"
import { StatusBar } from "@/components/layout/mobile-shell"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProductCard } from "@/components/cards/product-card"
import { CategoryGrid } from "@/components/cards/category-grid"
import { TrustBanner } from "@/components/cards/trust-banner"
import { useAuthStore, useUser, useCurrentLocation } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api/client"
import type { FeedResponse, CategoryResponse } from "@/lib/api/types"
import { MessageCircle, Search, Settings2 } from "lucide-react"

export function HomeScreen() {
  const user = useUser()
  const { city, lat, lng } = useCurrentLocation()
  
  // Fetch feed data
  const { data: feedData, isLoading: feedLoading } = useSWR<FeedResponse>(
    ["feed", city, lat, lng],
    async () => {
      const response = await apiClient.getFeed({ city, lat, lng })
      return response.data || { nearby: [], featured: [], recent: [], radiusKm: 10 }
    },
    { revalidateOnFocus: false }
  )

  // Fetch categories
  const { data: categories } = useSWR<CategoryResponse[]>(
    "categories",
    async () => {
      const response = await apiClient.getCategories()
      return response.data || []
    },
    { revalidateOnFocus: false }
  )

  const greeting = getGreeting()
  const displayName = user?.displayName?.split(" ")[0] || "there"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StatusBar variant="light" />
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {/* Header */}
        <div className="bg-card px-5 py-3.5 shadow-sm animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex justify-between items-center mb-3.5">
            <div>
              <div className="text-[10px] text-ink-3 font-bold tracking-wider mb-0.5">
                <span className="mr-1">📍</span>
                {city.toUpperCase()}
              </div>
              <h1 className="text-[17px] font-extrabold tracking-tight">
                {greeting}, {displayName} <span className="ml-0.5">👋</span>
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <Link
                href="/chat"
                className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center relative"
              >
                <MessageCircle className="w-[19px] h-[19px] text-ink-3" />
                <UnreadBadge />
              </Link>
              <Link
                href="/profile"
                className="avatar w-10 h-10 text-[15px]"
              >
                {user?.displayName?.[0] || user?.phone?.[0] || "U"}
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Link href="/browse" className="searchbar cursor-pointer">
            <Search className="w-[18px] h-[18px] text-ink-4" />
            <span className="flex-1 text-sm text-ink-4">
              Search phones, cars, land, fashion...
            </span>
            <button className="w-[34px] h-[34px] rounded-lg bg-ink flex items-center justify-center">
              <Settings2 className="w-[15px] h-[15px] text-white" />
            </button>
          </Link>
        </div>

        {/* Trust Banner */}
        <div className="px-5 mt-3.5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <TrustBanner />
        </div>

        {/* Categories */}
        <section className="mt-4">
          <div className="px-5 pb-2 flex justify-between items-center">
            <h2 className="text-sm font-bold">Categories</h2>
          </div>
          <CategoryGrid categories={categories || defaultCategories} />
        </section>

        {/* Near You */}
        <section className="mt-4">
          <div className="px-5 pb-2 flex justify-between items-center">
            <h2 className="text-sm font-bold">Near you</h2>
            <Link href="/browse" className="text-xs font-extrabold text-primary">
              All &rarr;
            </Link>
          </div>
          <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar pb-4">
            {feedLoading ? (
              <>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </>
            ) : feedData?.nearby && feedData.nearby.length > 0 ? (
              feedData.nearby.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} size="small" />
              ))
            ) : (
              <EmptyState message="No products nearby yet" />
            )}
          </div>
        </section>

        {/* Featured */}
        {feedData?.featured && feedData.featured.length > 0 && (
          <section className="mt-2">
            <div className="px-5 pb-2 flex justify-between items-center">
              <h2 className="text-sm font-bold">Featured</h2>
              <Link href="/browse?featured=true" className="text-xs font-extrabold text-primary">
                All &rarr;
              </Link>
            </div>
            <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar pb-4">
              {feedData.featured.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} size="small" featured />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {feedData?.recent && feedData.recent.length > 0 && (
          <section className="mt-2">
            <div className="px-5 pb-2 flex justify-between items-center">
              <h2 className="text-sm font-bold">Just listed</h2>
              <Link href="/browse?sort=recent" className="text-xs font-extrabold text-primary">
                All &rarr;
              </Link>
            </div>
            <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar pb-4">
              {feedData.recent.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} size="small" />
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function UnreadBadge() {
  const { data } = useSWR(
    "unread-count",
    async () => {
      try {
        const response = await apiClient.getUnreadCount()
        return response.data?.unreadCount || 0
      } catch {
        return 0
      }
    },
    { revalidateOnFocus: true, refreshInterval: 30000 }
  )

  if (!data || data === 0) return null

  return <div className="notif-dot" />
}

function ProductCardSkeleton() {
  return (
    <div className="w-[160px] flex-shrink-0 bg-card rounded-lg overflow-hidden shadow-sm border border-border">
      <div className="h-[110px] shimmer" />
      <div className="p-2.5">
        <div className="h-3 w-24 shimmer mb-2" />
        <div className="h-4 w-16 shimmer" />
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full py-8 text-center">
      <p className="text-sm text-ink-3">{message}</p>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const defaultCategories: CategoryResponse[] = [
  { id: "1", name: "Electronics", slug: "electronics", iconUrl: null },
  { id: "2", name: "Vehicles", slug: "vehicles", iconUrl: null },
  { id: "3", name: "Property", slug: "property", iconUrl: null },
  { id: "4", name: "Fashion", slug: "fashion", iconUrl: null },
  { id: "5", name: "Farm", slug: "farm", iconUrl: null },
  { id: "6", name: "Furniture", slug: "furniture", iconUrl: null },
]
