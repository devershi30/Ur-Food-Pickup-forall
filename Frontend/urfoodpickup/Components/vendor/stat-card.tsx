import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6"> 
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trendUp ? "text-green-600" : "text-red-600"}`}>
                {trendUp ? "↑" : "↓"} {trend}
              </p>
            )}
          </div>
          <div className="bg-[var(--color-secondary)]/10 p-3 rounded-full">
            <Icon className="h-6 w-6 text-[var(--color-secondary)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
