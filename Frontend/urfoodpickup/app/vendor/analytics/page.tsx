"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, TrendingUp, Users, Package, Star, Clock, Award } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 ${trendUp ? '' : 'rotate-180'}`} />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${trendUp ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Icon className={`h-6 w-6 ${trendUp ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface Analytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  completionRate: number
  averageRating: number
  pendingOrders: number
  revenueGrowth: number
  orderGrowth: number
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  topSellingItems: Array<{ name: string; orders: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  revenueByDay: Array<{ day: string; amount: number }>
}

export default function VendorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month">("week")
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/v1/vendorOrder/analytics", {
        params: { timeRange }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
      
      // Fallback to mock data for demo
      // Fallback to mock data for demo
setAnalytics({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  totalCustomers: 0,
  completionRate: 0,
  averageRating: 0,
  pendingOrders: 0,
  revenueGrowth: 0,
  orderGrowth: 0,
  dailyRevenue: [
    { date: "Mon", revenue: 0, orders: 0 },
    { date: "Tue", revenue: 0, orders: 0 },
    { date: "Wed", revenue: 0, orders: 0 },
    { date: "Thu", revenue: 0, orders: 0 },
    { date: "Fri", revenue: 0, orders: 0 },
    { date: "Sat", revenue: 0, orders: 0 },
    { date: "Sun", revenue: 0, orders: 0 },
  ],
  topSellingItems: [
    { name: "Classic Burger", orders: 0, revenue: 0 },
    { name: "Bacon Cheeseburger", orders: 0, revenue: 0 },
    { name: "Fries", orders: 0, revenue: 0 },
    { name: "Chicken Wings", orders: 0, revenue: 0 },
    { name: "Pepperoni Pizza", orders: 0, revenue: 0 },
  ],
  ordersByStatus: [
    { status: "Completed", count: 0 },
    { status: "Preparing", count: 0 },
    { status: "Ready", count: 0 },
    { status: "Cancelled", count: 0 },
  ],
  revenueByDay: [
    { day: "Mon", amount: 0 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 0 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 0 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 },
  ]
})

    } finally {
      setLoading(false)
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

  if (!analytics) return null

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your restaurant's performance and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "week"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "month"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={`${analytics.revenueGrowth.toFixed(1)}% from last ${timeRange}`}
          trendUp={analytics.revenueGrowth > 0}
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={ShoppingBag}
          trend={`${analytics.orderGrowth.toFixed(1)}% from last ${timeRange}`}
          trendUp={analytics.orderGrowth > 0}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Customers"
          value={analytics.totalCustomers}
          icon={Users}
          trend="12% from last week"
          trendUp={true}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate.toFixed(1)}%`}
          icon={Package}
        />
        <StatCard
          title="Average Rating"
          value={analytics.averageRating.toFixed(1)}
          icon={Star}
        />
        <StatCard
          title="Pending Orders"
          value={analytics.pendingOrders}
          icon={Clock}
        />
        <StatCard
          title="Top Performer"
          value={analytics.topSellingItems[0]?.name.substring(0, 15) || "N/A"}
          icon={Award}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: {
                  label: "Orders",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="orders" 
                    fill="var(--color-secondary)" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Orders",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Revenue ($)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueByDay} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="day" type="category" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--color-accent)" 
                    radius={[0, 8, 8, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topSellingItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-gray-100' : 'bg-orange-100'
                  }`}>
                    <span className={`font-bold ${
                      idx === 0 ? 'text-yellow-700' : idx === 1 ? 'text-gray-700' : 'text-orange-700'
                    }`}>
                      #{idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--color-primary)]">
                    ${item.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${(item.revenue / item.orders).toFixed(2)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}