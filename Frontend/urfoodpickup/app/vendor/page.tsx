"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/vendor/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DollarSign, ShoppingBag, TrendingUp, Store } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/axios"

interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  activeOrders: number
  isOpen: boolean
  todayGrowth: number
  revenueGrowth: number
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    isOpen: false,
    todayGrowth: 0,
    revenueGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      const nrole = `${user.role?.replace("ROLE_", "").toLowerCase()}`
      
      if (nrole === "vendor") {
        if (user.approved) {
          fetchDashboardStats()
        } else {
          if (user.appliedAsVendor) {
            router.push("/vendor/waiting")
          } else {
            router.push("/vendor/apply")
          }
        }
      }
    }
  }, [user, isLoading, router])

  const fetchDashboardStats = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await api.get("/api/v1/vendorDash/dashboard/stats")
      
      // Fetch vendor status (open/closed)
      const vendorResponse = await api.get("/api/v1/vendorDash/status")
      
      setStats({
        todayOrders: statsResponse.data.todayOrders || 0,
        todayRevenue: statsResponse.data.todayRevenue || 0,
        activeOrders: statsResponse.data.activeOrders || 0,
        isOpen: vendorResponse.data.isOpen || false,
        todayGrowth: statsResponse.data.todayGrowth || 0,
        revenueGrowth: statsResponse.data.revenueGrowth || 0,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOpen = async (checked: boolean) => {
    setUpdatingStatus(true)
    
    try {
      // Update vendor status in backend
      await api.put("/api/v1/vendorDash/status", {
        isOpen: checked
      })

      setStats({ ...stats, isOpen: checked })
      
      toast({
        title: checked ? "Restaurant opened" : "Restaurant closed",
        description: checked ? "You are now accepting orders" : "You are not accepting new orders",
      })
    } catch (error) {
      console.error("Failed to update restaurant status:", error)
      toast({
        title: "Error",
        description: "Failed to update restaurant status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
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
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's your restaurant overview
          </p>
        </div>
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <Label htmlFor="restaurant-status" className="font-medium text-sm sm:text-base">
              Restaurant Status
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="restaurant-status"
                checked={stats.isOpen}
                onCheckedChange={handleToggleOpen}
                disabled={updatingStatus}
              />
              <span
                className={`font-semibold text-sm sm:text-base ${
                  stats.isOpen ? "text-[var(--color-secondary)]" : "text-muted-foreground"
                }`}
              >
                {updatingStatus ? "Updating..." : stats.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={ShoppingBag}
          trend={`${Math.abs(stats.todayGrowth).toFixed(1)}% from yesterday`}
          trendUp={stats.todayGrowth >= 0}
        />
        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={`${Math.abs(stats.revenueGrowth).toFixed(1)}% from yesterday`}
          trendUp={stats.revenueGrowth >= 0}
        />
        <StatCard 
          title="Active Orders" 
          value={stats.activeOrders} 
          icon={TrendingUp} 
        />
        <StatCard
          title="Status"
          value={stats.isOpen ? "Open" : "Closed"}
          icon={Store}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/vendor/orders" className="block">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm sm:text-base mb-1">View Active Orders</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Manage and update order statuses
                </p>
              </div>
            </Link>

            <Link href="/vendor/menu" className="block">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm sm:text-base mb-1">Update Menu</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Add, edit, or remove menu items
                </p>
              </div>
            </Link>

            <Link href="/vendor/analytics" className="block">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm sm:text-base mb-1">View Analytics</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Check sales trends and performance
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          </CardHeader>
         
        </Card>
      </div>
    </div>
  )
}