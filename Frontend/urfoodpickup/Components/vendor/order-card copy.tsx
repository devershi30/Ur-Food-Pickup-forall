"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, MapPin, Package } from "lucide-react"
import type { VendorOrder } from "@/lib/vendor-mock-data"

interface OrderCardProps {
  order: VendorOrder
  onStatusChange: (orderId: string, newStatus: VendorOrder["status"]) => void
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const getNextStatus = (currentStatus: VendorOrder["status"]): VendorOrder["status"] | null => {
    if (currentStatus === "received") return "preparing"
    if (currentStatus === "preparing") return "ready"
    if (currentStatus === "ready") return "completed"
    return null
  }

  const nextStatus = getNextStatus(order.status)

  const statusColors = {
    received: "bg-blue-500",
    preparing: "bg-[var(--color-secondary)]",
    ready: "bg-[var(--color-accent)]",
    completed: "bg-gray-500",
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">Order #{order.id}</h3>
              <Badge className={statusColors[order.status]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.customerName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min ago
              </div>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {order.orderType === "pickup" ? <Package className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {order.orderType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {order.notes && (
          <div className="text-sm bg-muted p-2 rounded">
            <span className="font-medium">Note: </span>
            {order.notes}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="font-semibold text-lg text-[var(--color-secondary)]">${order.total.toFixed(2)}</span>
          {nextStatus && (
            <Button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="bg-[var(--color-secondary)] hover:bg-green-600"
            >
              Mark as {nextStatus}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
