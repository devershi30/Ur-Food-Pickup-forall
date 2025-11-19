"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderTimeline } from "@/components/student/order-timeline"
import { useWebSocket } from "@/lib/websocket-context"
import { Clock, Package, ChevronDown, ChevronUp, MapPin, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import Image from "next/image"

interface OrderItem {
  id: number
  foodItemId: number
  name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  orderType: string
  status: string
  deliveryLocation?: string
  specialInstructions?: string
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  estimatedTime: string
  vendorId: number
  vendorName: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const { isConnected, orderUpdates, subscribeToOrder } = useWebSocket()
  const { toast } = useToast()

  const activeOrders = orders.filter((o) => 
    !["COMPLETED", "CANCELLED"].includes(o.status)
  )

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/v1/orders/active")
      setOrders(response.data)
      
      // Subscribe to all active orders for WebSocket updates
      response.data.forEach((order: Order) => {
        subscribeToOrder(order.uid.toString())
      })
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle WebSocket order status updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1]
      
      setOrders((prev) =>
        prev.map((order) =>
          order.uid.toString() === latestUpdate.orderId
            ? { ...order, status: latestUpdate.status }
            : order
        )
      )

      // Show toast notification for status changes
      toast({
        title: "Order Status Updated",
        description: `Order #${latestUpdate.orderId} is now ${formatStatus(latestUpdate.status)}`,
      })
    }
  }, [orderUpdates, toast])

  const formatStatus = (status: string): string => {
    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "RECEIVED":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "PREPARING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "READY":
        return "bg-green-100 text-green-700 border-green-200"
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live Updates
          </Badge>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No active orders</p>
            <Button 
              onClick={() => window.location.href = "/student"}
              className="bg-[var(--color-primary)] hover:bg-blue-600"
            >
              Browse Vendors
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const isExpanded = expandedOrder === order.uid

            return (
              <Card key={order.uid} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{order.vendorName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">Order #{order.uid}</p>
                        {order.orderType === "DELIVERY" && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            Delivery
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div key={item.uid} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.menuFood.name}
                        </span>
                        <span className="text-muted-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryLocation && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Delivery to: {order.deliveryLocation.latitude?.toFixed(6)}, {order.deliveryLocation.longitude?.toFixed(6)}
                      </span>
                    </div>
                  )}

                  {order.specialInstructions && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <Receipt className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.specialInstructions}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{order.estimatedTime}</span>
                    </div>
                    <span className="font-semibold text-[var(--color-primary)]">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.uid)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Tracking
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Track Order
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="pt-4 border-t">
                      <OrderTimeline status={order.status} estimatedTime={order.estimatedTime} />
                      
                      <div className="mt-6 bg-muted p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span>${order.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span>Total</span>
                          <span className="text-[var(--color-primary)]">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}