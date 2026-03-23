"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { toast } from "sonner"
import { StatusBar } from "@/components/layout/mobile-shell"
import { VendorSheet } from "@/components/sheets/vendor-sheet"
import { CheckoutSheet } from "@/components/sheets/checkout-sheet"
import { useAuthStore, useIsAuthenticated } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api/client"
import type { ProductResponse, VendorProfileResponse, UserTrustScoreResponse } from "@/lib/api/types"
import { formatPrice, formatDistance, getTimeAgo } from "@/lib/utils"
import {
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Star,
  MapPin,
  MessageCircle,
  ChevronRight,
  Truck,
  Package,
  CheckCircle,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  
  const [showVendorSheet, setShowVendorSheet] = useState(false)
  const [showCheckoutSheet, setShowCheckoutSheet] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Fetch product
  const { data: product, isLoading: productLoading } = useSWR<ProductResponse>(
    ["product", id],
    async () => {
      const response = await apiClient.getProduct(id)
      return response.data || null
    }
  )

  // Fetch vendor
  const { data: vendor } = useSWR<VendorProfileResponse>(
    product ? ["vendor", product.vendorId] : null,
    async () => {
      const response = await apiClient.getVendorProfile(product!.vendorId)
      return response.data || null
    }
  )

  // Fetch trust score
  const { data: trustScore } = useSWR<UserTrustScoreResponse>(
    product ? ["trust-score", product.vendorId] : null,
    async () => {
      const response = await apiClient.getVendorTrustScore(product!.vendorId)
      return response.data || null
    }
  )

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items")
      return
    }
    
    try {
      if (isFavorite) {
        await apiClient.removeSavedProduct(id)
        toast.success("Removed from saved items")
      } else {
        await apiClient.saveProduct(id)
        toast.success("Saved to favorites")
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      toast.error("Failed to update saved items")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `Check out ${product?.title} on NearBuy`,
          url: window.location.href,
        })
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase")
      router.push("/auth/login")
      return
    }
    setShowCheckoutSheet(true)
  }

  const handleMessage = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to message seller")
      router.push("/auth/login")
      return
    }
    // Navigate to chat with vendor
    router.push(`/chat?vendorId=${product?.vendorId}`)
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StatusBar variant="transparent" />
        <div className="h-[320px] shimmer" />
        <div className="p-5">
          <div className="h-6 w-3/4 shimmer mb-2" />
          <div className="h-8 w-1/2 shimmer mb-4" />
          <div className="h-4 w-full shimmer mb-2" />
          <div className="h-4 w-2/3 shimmer" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">Product not found</h2>
          <button onClick={() => router.back()} className="text-primary font-semibold">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const images = product.images.length > 0 ? product.images : [null]

  return (
    <div className="min-h-screen bg-background">
      {/* Image Gallery */}
      <div className="relative h-[320px] bg-gradient-to-br from-primary/20 to-primary/5">
        <StatusBar variant="transparent" />
        
        {images[activeImageIndex] ? (
          <Image
            src={images[activeImageIndex] as string}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-40">
              {getCategoryIcon(product.category)}
            </span>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="float-back"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-[66px] right-4 flex flex-col gap-2">
          <button
            onClick={handleFavorite}
            className="w-[38px] h-[38px] rounded-full bg-white/92 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Heart className={`w-[18px] h-[18px] ${isFavorite ? "fill-destructive text-destructive" : "text-ink-3"}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-[38px] h-[38px] rounded-full bg-white/92 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Share2 className="w-[18px] h-[18px] text-ink-3" />
          </button>
        </div>

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activeImageIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Transaction Mode Badge */}
        {product.transactionMode !== "STANDARD_COMMERCE" && (
          <div className="absolute bottom-4 left-4">
            <span className="tag tag-amber">
              {product.transactionMode === "VEHICLE_DEPOSIT" ? "10% Deposit" : "Deal Room"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Price */}
        <div className="mb-4">
          <h1 className="text-xl font-extrabold leading-tight mb-1">{product.title}</h1>
          <p className="text-2xl font-black text-primary-dark tracking-tight">
            {formatPrice(product.price)}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {product.city}
            </span>
            <span>Listed {getTimeAgo(product.createdAt)}</span>
          </div>
        </div>

        {/* Vendor Card */}
        <button
          onClick={() => setShowVendorSheet(true)}
          className="w-full bg-card rounded-lg p-3.5 shadow-sm border border-border flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-lg font-bold text-primary-dark">
            {vendor?.businessName?.[0] || "V"}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{vendor?.businessName || "Seller"}</span>
              {vendor?.verified && (
                <span className="tag tag-green py-0.5 px-1.5 text-[8px]">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-3">
              {trustScore && (
                <>
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {trustScore.averageRating}
                  </span>
                  <span>·</span>
                  <span>{trustScore.reviewCount} reviews</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-4" />
        </button>

        {/* Trust Badge */}
        <div className="bg-primary-light rounded-lg p-3.5 flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary-dark mb-0.5">
              NearBuy Guarantee
            </p>
            <p className="text-[11px] text-primary/70">
              Pay into escrow · Receive item · Confirm · Seller gets paid
            </p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2">Description</h3>
            <p className="text-sm text-ink-2 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Fulfillment Options */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">Fulfillment</h3>
          <div className="flex gap-2">
            {product.pickupAvailable && (
              <div className="flex-1 bg-background border border-border rounded-lg p-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-ink-3" />
                <span className="text-xs font-semibold">Pickup available</span>
              </div>
            )}
            {product.fulfillmentPolicy !== "PICKUP_ONLY" && (
              <div className="flex-1 bg-background border border-border rounded-lg p-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-ink-3" />
                <span className="text-xs font-semibold">Delivery available</span>
              </div>
            )}
          </div>
        </div>

        {/* Spacer for fixed CTA */}
        <div className="h-24" />
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={handleMessage}
            className="flex-1 bg-background border border-border rounded-md py-3.5 font-bold text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-[2] bg-primary text-white rounded-md py-3.5 font-black text-[15px] transition-all active:scale-[0.98]"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Sheets */}
      <VendorSheet
        open={showVendorSheet}
        onOpenChange={setShowVendorSheet}
        vendor={vendor}
        trustScore={trustScore}
        onMessage={handleMessage}
      />

      <CheckoutSheet
        open={showCheckoutSheet}
        onOpenChange={setShowCheckoutSheet}
        product={product}
        vendor={vendor}
      />
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    electronics: "📱",
    vehicles: "🚗",
    property: "🏠",
    fashion: "👗",
    farm: "🌾",
    furniture: "🛋️",
  }
  return icons[category.toLowerCase()] || "📦"
}
