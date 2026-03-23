"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, Phone, MessageCircle, Store, Copy, ExternalLink, Shield, AlertCircle } from "lucide-react"
import { api } from "@/lib/api/client"
import type { Order } from "@/lib/api/types"
import { formatCurrency } from "@/lib/utils"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.orders.getOrder(orderId)
        if (response.data) {
          setOrder(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
    }
  }

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: Package },
      { key: "processing", label: "Processing", icon: Clock },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle },
    ]
    
    const currentIndex = steps.findIndex(s => s.key === order?.status)
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background z-10 px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-muted" />
            <div className="h-6 bg-muted rounded w-32" />
          </div>
        </div>
        <div className="p-4 animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  const statusSteps = getStatusSteps()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold">Order #{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" && (
        <div className="px-4 py-6">
          <div className="bg-card rounded-xl p-4 border">
            <h2 className="font-semibold mb-4">Order Status</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />
              <div 
                className="absolute left-5 top-0 w-0.5 bg-primary transition-all"
                style={{ 
                  height: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%` 
                }}
              />

              {/* Steps */}
              <div className="space-y-6">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      step.completed 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-medium ${step.completed ? "" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {step.current && order.statusHistory?.[index] && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.statusHistory[index].timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && order.status !== "delivered" && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Estimated delivery:</span>
                  <span className="font-medium">
                    {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancelled Status */}
      {order.status === "cancelled" && (
        <div className="px-4 py-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Order Cancelled</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  {order.cancellationReason || "This order has been cancelled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Info */}
      {order.trackingNumber && (
        <div className="px-4 pb-4">
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-mono font-medium">{order.trackingNumber}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={copyTrackingNumber}
                  className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Items ({order.items.length})</h2>
              <button 
                onClick={() => router.push(`/vendor/${order.vendorId}`)}
                className="flex items-center gap-1 text-sm text-primary"
              >
                <Store className="w-4 h-4" />
                <span>View Shop</span>
              </button>
            </div>
          </div>
          
          {order.items.map((item, index) => (
            <div 
              key={item.id}
              className={`flex gap-4 p-4 ${index > 0 ? "border-t" : ""}`}
            >
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden relative flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                {item.variant && (
                  <p className="text-sm text-muted-foreground">{item.variant}</p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                <p className="text-primary font-semibold mt-1">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-semibold">Delivery Address</p>
              <p className="text-sm text-muted-foreground mt-1">{order.deliveryAddress?.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress?.address}</p>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{order.deliveryAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl p-4 border">
          <h2 className="font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          
          {/* Escrow Status */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Escrow Protected</p>
                <p className="text-xs text-muted-foreground">
                  Payment held securely until delivery confirmed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/chat/${order.conversationId}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Seller
          </button>
          {order.status === "delivered" && (
            <button 
              onClick={() => router.push(`/orders/${order.id}/review`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Write Review
            </button>
          )}
          {order.status === "pending" && (
            <button 
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-medium"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
