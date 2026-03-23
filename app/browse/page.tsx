"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { StatusBar } from "@/components/layout/mobile-shell"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProductCard } from "@/components/cards/product-card"
import { FilterSheet } from "@/components/sheets/filter-sheet"
import { useCurrentLocation } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api/client"
import type { DiscoveryProductResponse, PageResponse } from "@/lib/api/types"
import { Search, Settings2, ArrowLeft, X } from "lucide-react"

function BrowseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { city, lat, lng } = useCurrentLocation()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    radius: 10,
    verifiedOnly: false,
    deliveryOnly: false,
    minPrice: "",
    maxPrice: "",
  })

  // Fetch products
  const { data, isLoading, mutate } = useSWR<PageResponse<DiscoveryProductResponse>>(
    ["products", city, lat, lng, activeCategory, searchQuery, filters],
    async () => {
      if (searchQuery) {
        const response = await apiClient.searchProducts({
          q: searchQuery,
          city,
          lat,
          lng,
          category: activeCategory || undefined,
          radius: filters.radius,
        })
        return response.data || { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
      } else {
        const response = await apiClient.getProducts({
          city,
          lat,
          lng,
          category: activeCategory || undefined,
          radius: filters.radius,
        })
        return response.data || { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
      }
    },
    { revalidateOnFocus: false }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    mutate()
  }

  const categories = [
    { slug: "", label: "All" },
    { slug: "electronics", label: "Electronics" },
    { slug: "vehicles", label: "Vehicles" },
    { slug: "property", label: "Property" },
    { slug: "fashion", label: "Fashion" },
    { slug: "farm", label: "Farm" },
    { slug: "furniture", label: "Furniture" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StatusBar variant="light" />

      {/* Search Header */}
      <div className="bg-card px-4 py-3 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-ink-3" />
          </button>

          <div className="searchbar flex-1">
            <Search className="w-[18px] h-[18px] text-ink-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none text-sm text-ink"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-5 h-5 rounded-full bg-ink-4/20 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-ink-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="w-[34px] h-[34px] rounded-lg bg-ink flex items-center justify-center flex-shrink-0"
          >
            <Settings2 className="w-[15px] h-[15px] text-white" />
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-white"
                  : "bg-background border border-border text-ink-2"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            <div className="px-4 py-2 text-xs text-ink-3 font-semibold">
              {data.totalElements} result{data.totalElements !== 1 ? "s" : ""} found
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {data.content.map((product) => (
                <ProductCard key={product.id} product={product} size="medium" />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-ink-4" />
            </div>
            <h3 className="text-base font-bold text-ink mb-1">No products found</h3>
            <p className="text-sm text-ink-3 text-center">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>

      <FilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <BottomNav />
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
      <div className="h-[140px] shimmer" />
      <div className="p-2.5">
        <div className="h-4 w-3/4 shimmer mb-2" />
        <div className="h-5 w-1/2 shimmer mb-2" />
        <div className="h-3 w-1/3 shimmer" />
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
