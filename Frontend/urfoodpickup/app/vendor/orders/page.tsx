"use client"

import { useState, useEffect } from "react"
import { OrderCard } from "@/components/vendor/order-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/lib/websocket-context"
import { useToast } from "@/hooks/use-toast"
import { Package, RefreshCw, Clock, CheckCircle2, Truck } from "lucide-react"
import api from "@/lib/axios"

interface OrderItem {
  uid: string
  menuFood: {
    uid: string
    name: string
    description: string
    price: number
    category: string
  }
  quantity: number
  price: number
}

interface VendorOrder {
  uid: string
  student: {
    uid: string
    name: string
    email: string
    username: string
  }
  orderItems: OrderItem[]
  deliveryType: "PICKUP" | "DELIVERY"
  deliveryLocation?: {
    latitude: number
    longitude: number
  }
  status: "PENDING" | "RECEIVED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED"
  specialInstructions?: string
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  estimatedTime: string
  createdAt: string
  updatedAt?: string
  payments: Array<{
    uid: string
    paymentMethod: string
    status: string
    amount: number
  }>
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const { isConnected, subscribeToOrder } = useWebSocket()

  useEffect(() => {
    fetchOrders()
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/v1/vendorOrder/orders/active")
      setOrders(response.data)
      
      // Subscribe to all orders for real-time updates
      response.data.forEach((order: VendorOrder) => {
        subscribeToOrder(order.uid)
      })
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    
    try {
      await api.put(`/api/v1/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      })

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.uid === orderId ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() } : order
        )
      )

      // Show success message
      const statusMessages = {
        RECEIVED: "Order confirmed and received",
        PREPARING: "Started preparing order",
        READY: "Order is ready for pickup/delivery",
        OUT_FOR_DELIVERY: "Order is out for delivery",
        COMPLETED: "Order completed successfully",
      }

      toast({
        title: "Order status updated",
        description: statusMessages[newStatus as keyof typeof statusMessages] || "Status updated",
      })

      // Play notification sound (optional)
      playNotificationSound()
      
    } catch (error: any) {
      console.error("Failed to update order status:", error)
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
    } finally {
      setUpdating(null)
    }
  }

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status))
  const receivedOrders = orders.filter((o) => o.status === "RECEIVED")
  const preparingOrders = orders.filter((o) => o.status === "PREPARING")
  const readyOrders = orders.filter((o) => o.status === "READY")
  const deliveryOrders = orders.filter((o) => o.status === "OUT_FOR_DELIVERY")

  const getTabIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="h-4 w-4 mr-1" />
      case "preparing":
        return <Package className="h-4 w-4 mr-1" />
      case "ready":
        return <CheckCircle2 className="h-4 w-4 mr-1" />
      case "delivery":
        return <Truck className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live Updates
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">All Active</p>
              <p className="text-2xl font-bold text-blue-700">{activeOrders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Received</p>
              <p className="text-2xl font-bold text-yellow-700">{receivedOrders.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Preparing</p>
              <p className="text-2xl font-bold text-orange-700">{preparingOrders.length}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Ready</p>
              <p className="text-2xl font-bold text-green-700">{readyOrders.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Delivery</p>
              <p className="text-2xl font-bold text-purple-700">{deliveryOrders.length}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-600 opacity-80" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center">
            All ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="flex items-center">
            {getTabIcon("received")}
            Received ({receivedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex items-center">
            {getTabIcon("preparing")}
            Preparing ({preparingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center">
            {getTabIcon("ready")}
            Ready ({readyOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center">
            {getTabIcon("delivery")}
            Delivery ({deliveryOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No active orders</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeOrders.map((order) => (
                <OrderCard 
                  key={order.uid} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  isUpdating={updating === order.uid}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {receivedOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No received orders</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {receivedOrders.map((order) => (
                <OrderCard 
                  key={order.uid} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  isUpdating={updating === order.uid}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparing" className="space-y-4">
          {preparingOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders in preparation</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {preparingOrders.map((order) => (
                <OrderCard 
                  key={order.uid} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  isUpdating={updating === order.uid}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {readyOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders ready</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {readyOrders.map((order) => (
                <OrderCard 
                  key={order.uid} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  isUpdating={updating === order.uid}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          {deliveryOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders out for delivery</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {deliveryOrders.map((order) => (
                <OrderCard 
                  key={order.uid} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  isUpdating={updating === order.uid}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}