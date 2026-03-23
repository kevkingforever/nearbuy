"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { cn, formatPrice, formatDistance } from "@/lib/utils"
import type { DiscoveryProductResponse } from "@/lib/api/types"

interface ProductCardProps {
  product: DiscoveryProductResponse
  size?: "small" | "medium" | "large"
  featured?: boolean
  onFavorite?: (productId: string) => void
  isFavorite?: boolean
}

export function ProductCard({ 
  product, 
  size = "medium",
  featured = false,
  onFavorite,
  isFavorite = false,
}: ProductCardProps) {
  const sizeClasses = {
    small: "w-[160px]",
    medium: "w-full",
    large: "w-full",
  }

  const imageHeights = {
    small: "h-[110px]",
    medium: "h-[140px]",
    large: "h-[180px]",
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "product-card flex-shrink-0 border border-border",
        sizeClasses[size]
      )}
    >
      {/* Image */}
      <div className={cn("relative overflow-hidden", imageHeights[size])}>
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl opacity-50">
              {getCategoryIcon(product.category)}
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-2 left-2">
            <span className="tag tag-gold">
              <Star className="w-3 h-3" /> Featured
            </span>
          </div>
        )}

        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFavorite(product.id)
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "w-[15px] h-[15px]",
                isFavorite ? "fill-destructive text-destructive" : "text-ink-3"
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn("p-2.5", size === "large" && "p-3.5")}>
        <h3 className={cn(
          "font-extrabold leading-tight mb-0.5 line-clamp-2",
          size === "small" ? "text-[11px]" : "text-sm"
        )}>
          {product.title}
        </h3>
        
        <p className={cn(
          "font-black text-primary-dark tracking-tight",
          size === "small" ? "text-[13px]" : "text-base"
        )}>
          {formatPrice(product.price)}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-ink-4">
            📍 {formatDistance(product.distanceKm)} · {product.city}
          </span>
        </div>

        {/* Vendor info for larger cards */}
        {size === "large" && product.vendorName && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
            <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary-dark">
              {product.vendorName[0]}
            </div>
            <span className="text-[11px] text-ink-3 font-semibold">
              {product.vendorName}
            </span>
            {product.subscriptionTier === "FEATURED" && (
              <span className="tag tag-green text-[8px] py-0.5 px-1.5">
                Verified
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    electronics: "📱",
    vehicles: "🚗",
    property: "🏠",
    "property-land": "🏠",
    fashion: "👗",
    farm: "🌾",
    "farm-produce": "🌾",
    furniture: "🛋️",
    "furniture-home": "🛋️",
  }
  return icons[category.toLowerCase()] || "📦"
}
