"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, MapPin, ShoppingBag, AlertCircle } from "lucide-react"
import { api } from "@/lib/api/client"
import type { Order } from "@/lib/api/types"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"

type OrderStatus = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OrderStatus>("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await api.orders.getOrders({ 
          page: 1, 
          limit: 20,
          status: activeTab === "all" ? undefined : activeTab
        })
        if (response.data) {
          setOrders(response.data.items)
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, router, activeTab])

  const tabs: { value: OrderStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-primary" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "shipped":
        return "bg-primary/10 text-primary"
      case "delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background z-10 px-4 pt-4 pb-2 border-b">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">My Orders</h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl p-4 border">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => router.push("/browse")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Browse Products
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full bg-card rounded-xl p-4 border hover:border-primary/20 transition-colors text-left"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(order.createdAt)}
                </span>
              </div>

              {/* Order Items */}
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {order.items[0]?.image ? (
                    <Image
                      src={order.items[0].image}
                      alt={order.items[0].name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {order.items.length > 1 && (
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-background/90 rounded text-xs font-medium">
                      +{order.items.length - 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.items[0]?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-primary font-semibold mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
              </div>

              {/* Delivery Info */}
              {order.status === "shipped" && order.estimatedDelivery && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Arriving</span>
                  <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}

              {/* Tracking */}
              {order.trackingNumber && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tracking:</span>
                  <span className="font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
