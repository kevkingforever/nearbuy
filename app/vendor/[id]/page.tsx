"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, Shield, MapPin, Clock, MessageCircle, ChevronRight, ShoppingBag, Heart, Share2, Phone, BadgeCheck, Store, Package } from "lucide-react"
import { api } from "@/lib/api/client"
import type { VendorProfile, Product } from "@/lib/api/types"
import { ProductCard } from "@/components/cards/product-card"
import { formatCurrency } from "@/lib/utils"

export default function VendorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  
  const [vendor, setVendor] = useState<VendorProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products")
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const [vendorRes, productsRes] = await Promise.all([
          api.vendors.getProfile(vendorId),
          api.vendors.getProducts(vendorId, { page: 1, limit: 20 })
        ])
        if (vendorRes.data) setVendor(vendorRes.data)
        if (productsRes.data) setProducts(productsRes.data.items)
      } catch (error) {
        console.error("Failed to fetch vendor:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [vendorId])

  const handleStartChat = async () => {
    try {
      const response = await api.chat.startConversation(vendorId)
      if (response.data) {
        router.push(`/chat/${response.data.id}`)
      }
    } catch (error) {
      console.error("Failed to start chat:", error)
    }
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getTrustLabel = (score: number) => {
    if (score >= 80) return "Highly Trusted"
    if (score >= 60) return "Verified"
    return "New Seller"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-48 bg-muted" />
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        {vendor.coverImage && (
          <Image
            src={vendor.coverImage}
            alt={vendor.businessName}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl p-4 shadow-lg border">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted flex-shrink-0">
              {vendor.profileImage ? (
                <Image
                  src={vendor.profileImage}
                  alt={vendor.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Store className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg truncate">{vendor.businessName}</h1>
                {vendor.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{vendor.username}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({vendor.totalReviews})</span>
                </div>
                <div className={`flex items-center gap-1 ${getTrustColor(vendor.trustScore)}`}>
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{vendor.trustScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold">{vendor.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{vendor.completedOrders}</p>
              <p className="text-xs text-muted-foreground">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{vendor.responseRate}%</p>
              <p className="text-xs text-muted-foreground">Response</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleStartChat}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl font-medium">
              <Phone className="w-5 h-5" />
              Call
            </button>
          </div>
        </div>
      </div>

      {/* Trust Score Card */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                vendor.trustScore >= 80 ? "bg-emerald-100" : vendor.trustScore >= 60 ? "bg-amber-100" : "bg-red-100"
              }`}>
                <Shield className={`w-6 h-6 ${getTrustColor(vendor.trustScore)}`} />
              </div>
              <div>
                <p className={`font-semibold ${getTrustColor(vendor.trustScore)}`}>
                  {getTrustLabel(vendor.trustScore)}
                </p>
                <p className="text-sm text-muted-foreground">Trust Score: {vendor.trustScore}/100</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Trust Factors */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Member since {new Date(vendor.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>{vendor.completedOrders}+ successful deliveries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Hours */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-4 border space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{vendor.location?.address || "Location not specified"}</p>
              <p className="text-sm text-muted-foreground">{vendor.location?.city}, {vendor.location?.state}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Business Hours</p>
              <p className="text-sm text-muted-foreground">
                {vendor.businessHours || "Mon - Sat: 9:00 AM - 6:00 PM"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "products" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Products ({vendor.totalProducts})
            {activeTab === "products" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "reviews" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Reviews ({vendor.totalReviews})
            {activeTab === "reviews" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === "products" ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {vendor.reviews?.map((review) => (
              <div key={review.id} className="bg-card rounded-xl p-4 border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {review.buyerImage ? (
                      <Image
                        src={review.buyerImage}
                        alt={review.buyerName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {review.buyerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.buyerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
