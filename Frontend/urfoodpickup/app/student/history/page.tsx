"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw, Package, Calendar, MapPin, Receipt, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

interface DeliveryLocation {
  latitude: number
  longitude: number
}

interface OrderItem {
  uid: string
  menuFood: {
    uid: string
    name: string
    description: string
    price: number
    category: string
    available: boolean
    createdOn: string
  }
  quantity: number
  price: number
}

interface Payment {
  uid: string
  amount: number
  currency: string
  paymentMethod: "CARD" | "CASH" | "MOBILE_MONEY"
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED"
  transactionId: string
  createdAt: string
}

interface Order {
  uid: string
  vendor: {
    uid: string
    vendorLocation: {
      restaurantName: string
      address: string
      phone: string
    }
    rating: number
  }
  orderItems: OrderItem[]
  deliveryType: "PICKUP" | "DELIVERY"
  deliveryLocation?: DeliveryLocation
  status: "PENDING" | "RECEIVED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED"
  specialInstructions?: string
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  estimatedTime: string
  createdAt: string
  completedAt?: string
  payments: Payment[]
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    fetchOrderHistory()
  }, [])

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get("/api/v1/orders/history")
      setOrders(response.data)
    } catch (error) {
      console.error("Failed to fetch order history:", error)
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (order: Order) => {
    try {
      // Add all items from the order to cart
      order.orderItems.forEach((item) => {
        addItem({
          id: item.menuFood.uid,
          uid: item.menuFood.uid,
          name: item.menuFood.name,
          price: item.menuFood.price,
          quantity: item.quantity,
          vendor: {
            vendorLocation: {
              restaurantName: order.vendor.vendorLocation.restaurantName,
            },
          },
        })
      })

      toast({
        title: "Items added to cart",
        description: `${order.orderItems.length} items from ${order.vendor.vendorLocation.restaurantName} added to your cart`,
      })

      router.push("/student/cart")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600"
      case "REFUNDED":
        return "text-blue-600"
      case "FAILED":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No order history yet</p>
            <Button 
              onClick={() => router.push("/student")}
              className="bg-[var(--color-primary)] hover:bg-blue-600"
            >
              Browse Vendors
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.uid
            const payment = order.payments?.[0]

            return (
              <Card key={order.uid} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {order.vendor.vendorLocation.restaurantName}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </div>
                        <span>•</span>
                        <span>{formatTime(order.createdAt)}</span>
                        {order.deliveryType === "DELIVERY" && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              Delivery
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.orderItems.map((item) => (
                      <div key={item.uid} className="flex justify-between text-sm">
                        <span className="flex-1">
                          {item.quantity}x {item.menuFood.name}
                        </span>
                        <span className="text-muted-foreground ml-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {payment && (
                    <div className="flex items-center gap-2 text-sm mb-4 p-2 bg-muted rounded">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium">{payment.paymentMethod}</span>
                      <span className={`ml-auto font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      disabled={order.status === "CANCELLED"}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>
                    <span className="font-semibold text-[var(--color-primary)]">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.uid)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Order Details */}
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm">Order Details</h4>
                        
                        <div className="space-y-2 text-sm">
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
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total</span>
                            <span className="text-[var(--color-primary)]">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vendor Info */}
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm">Vendor Information</h4>
                        <div className="text-sm space-y-1">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {order.vendor.vendorLocation.address}
                          </p>
                          {order.vendor.vendorLocation.phone && (
                            <p className="text-muted-foreground">
                              📞 {order.vendor.vendorLocation.phone}
                            </p>
                          )}
                          {order.vendor.rating > 0 && (
                            <p className="text-muted-foreground">
                              ⭐ {order.vendor.rating.toFixed(1)} rating
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Special Instructions</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      {/* Payment Details */}
                      {payment && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <h4 className="font-semibold text-sm">Payment Information</h4>
                          <div className="text-sm space-y-1">
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">Method</span>
                              <span>{payment.paymentMethod}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span className={getPaymentStatusColor(payment.status)}>
                                {payment.status}
                              </span>
                            </p>
                            {payment.transactionId && (
                              <p className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono text-xs">
                                  {payment.transactionId.substring(0, 16)}...
                                </span>
                              </p>
                            )}
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-semibold">
                                ${payment.amount.toFixed(2)} {payment.currency}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                        {order.completedAt && (
                          <p>Completed: {new Date(order.completedAt).toLocaleString()}</p>
                        )}
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