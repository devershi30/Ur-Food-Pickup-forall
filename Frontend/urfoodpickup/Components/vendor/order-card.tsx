"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  User, 
  Receipt, 
  Package, 
  CheckCircle2,  
  Truck,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useState } from "react"

interface OrderCardProps {
  order: {
    uid: string
    student: {
      uid: string
      name: string 
      email: string
      username: string
    }
    orderItems: Array<{
      uid: string
      menuFood: {
        name: string
        price: number
      }
      quantity: number
      price: number
    }>
    deliveryType: "PICKUP" | "DELIVERY"
    deliveryLocation?: {
      latitude: number
      longitude: number
    }
    status: string
    specialInstructions?: string
    subtotal: number
    deliveryFee: number
    tax: number
    total: number
    estimatedTime: string
    createdAt: string
    payments: Array<{
      paymentMethod: string
      status: string
      amount: number
    }>
  }
  onStatusChange: (orderId: string, newStatus: string) => void
  isUpdating?: boolean
}

export function OrderCard({ order, onStatusChange, isUpdating }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700"
      case "RECEIVED":
        return "bg-yellow-100 text-yellow-700"
      case "PREPARING":
        return "bg-orange-100 text-orange-700"
      case "READY":
        return "bg-green-100 text-green-700"
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const workflow = {
      PENDING: "RECEIVED",
      RECEIVED: "PREPARING",
      PREPARING: "READY",
      READY: order.deliveryType === "DELIVERY" ? "OUT_FOR_DELIVERY" : "COMPLETED",
      OUT_FOR_DELIVERY: "COMPLETED",
    }
    return workflow[currentStatus as keyof typeof workflow]
  }

  const getNextActionLabel = (currentStatus: string) => {
    const labels = {
      PENDING: "Accept Order",
      RECEIVED: "Start Preparing",
      PREPARING: "Mark as Ready",
      READY: order.deliveryType === "DELIVERY" ? "Out for Delivery" : "Complete Order",
      OUT_FOR_DELIVERY: "Complete Delivery",
    }
    return labels[currentStatus as keyof typeof labels]
  }

  const getNextActionIcon = (currentStatus: string) => {
    const icons = {
      PENDING: <CheckCircle2 className="h-4 w-4" />,
      RECEIVED: <Package className="h-4 w-4" />,
      PREPARING: <CheckCircle2 className="h-4 w-4" />,
      READY: order.deliveryType === "DELIVERY" ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />,
      OUT_FOR_DELIVERY: <CheckCircle2 className="h-4 w-4" />,
    }
    return icons[currentStatus as keyof typeof icons]
  }

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const orderTime = new Date(dateString)
    const diffMs = now.getTime() - orderTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const payment = order.payments?.[0]
  const canProgress = !["COMPLETED", "CANCELLED"].includes(order.status)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Order #{order.uid.substring(0, 8)}
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-4 w-4" />
              <span>{timeAgo(order.createdAt)}</span>
              {order.deliveryType === "DELIVERY" && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    <Truck className="h-3 w-3 mr-1" />
                    Delivery
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-[var(--color-primary)]">
              ${order.total.toFixed(2)}
            </p>
            {payment && (
              <Badge 
                variant="outline" 
                className={payment.status === "COMPLETED" ? "bg-green-50 text-green-700" : ""}
              >
                {payment.paymentMethod}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="bg-muted p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.student.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{order.student.email}</span>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Items ({order.orderItems.length})</p>
          {order.orderItems.slice(0, isExpanded ? undefined : 2).map((item) => (
            <div key={item.uid} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuFood.name}
              </span>
              <span className="text-muted-foreground">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {order.orderItems.length > 2 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <ChevronDown className="h-4 w-4" />
              Show {order.orderItems.length - 2} more items
            </button>
          )}
          {isExpanded && order.orderItems.length > 2 && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <ChevronUp className="h-4 w-4" />
              Show less
            </button>
          )}
        </div>

        {/* Delivery Location */}
        {order.deliveryType === "DELIVERY" && order.deliveryLocation && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Delivery Location</p>
                <p className="text-blue-700 text-xs font-mono mt-1">
                  {order.deliveryLocation.latitude.toFixed(6)}, {order.deliveryLocation.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-start gap-2 text-sm">
              <Receipt className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">Special Instructions</p>
                <p className="text-yellow-700 mt-1">{order.specialInstructions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Est. Time: {order.estimatedTime}</span>
        </div>

        {/* Action Buttons */}
        {canProgress && (
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-[var(--color-primary)] hover:bg-blue-600"
              onClick={() => onStatusChange(order.uid, getNextStatus(order.status))}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {getNextActionIcon(order.status)}
                  {getNextActionLabel(order.status)}
                </div>
              )}
            </Button>
            {order.status === "RECEIVED" && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => onStatusChange(order.uid, "CANCELLED")}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {order.status === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-700">Order Completed</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
