import { CheckCircle, Clock, Package, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderTimelineProps {
  status: "received" | "preparing" | "ready" | "completed"
  estimatedTime?: string
}

export function OrderTimeline({ status, estimatedTime }: OrderTimelineProps) {
  const steps = [
    {
      id: "received",
      label: "Order Received",
      description: "Your order has been received",
      icon: CheckCircle,
    },
    {
      id: "preparing",
      label: "In Preparation",
      description: "Your food is being prepared",
      icon: Utensils,
    },
    {
      id: "ready",
      label: "Ready for Pickup",
      description: "Your order is ready",
      icon: Package,
    },
    {
      id: "completed",
      label: "Completed",
      description: "Order completed",
      icon: CheckCircle,
    },
  ]

  const statusOrder = ["received", "preparing", "ready", "completed"]
  const currentIndex = statusOrder.indexOf(status)

  return (
    <div className="space-y-6">
      {estimatedTime && status !== "completed" && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="h-5 w-5 text-[var(--color-primary)]" />
          <div>
            <p className="font-semibold text-sm">Estimated Time</p>
            <p className="text-sm text-muted-foreground">{estimatedTime}</p>
          </div>
        </div>
      )}

      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4 pb-8">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all",
                      isCompleted
                        ? "bg-[var(--color-secondary)] border-[var(--color-secondary)] text-white"
                        : "bg-white border-gray-300 text-gray-400",
                      isCurrent && "ring-4 ring-[var(--color-secondary)]/20 animate-pulse",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "absolute top-12 w-1 h-full transition-all",
                        isCompleted ? "bg-[var(--color-secondary)]" : "bg-gray-300",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3
                    className={cn(
                      "font-semibold mb-1 transition-colors",
                      isCompleted ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {isCurrent && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
                      <span className="text-sm font-medium text-[var(--color-secondary)]">In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
