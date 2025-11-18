"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/vendor/stat-card"
import { Users, Store, ShoppingBag, DollarSign, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import api from "@/lib/axios"
import { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"


export default function AdminDashboardPage() {
 

  const [dashboardStats, setDashboardStats] = useState({});
  const [pendingVendors, setPendingVendors] = useState([]);


  const fetchData = async () => {
    try {
      // Fetch admin stats
      const statsRes = await api.get("/api/v1/admin/stats");
      setDashboardStats(statsRes.data);

      // Fetch pending vendor applications
      const vendorsRes = await api.get("/api/v1/vendor/listPendingApplications");
      console.log(vendorsRes)
      setPendingVendors(vendorsRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };


  useEffect(() => {
    
    fetchData();
  }, []);

  const { toast } = useToast()
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [loading, setLoading] = useState(false)



  const handleApprove = async () => {
    if (!selectedVendor) return
    setLoading(true)
    try {
      await api.put(`/api/v1/vendor/approveApplication/${selectedVendor.uid}`)
      toast({ title: "Approved", description: `${selectedVendor.vendorLocation.restaurantName} approved successfully.` })
      setSelectedVendor(null)
      fetchData();
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to approve vendor", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedVendor) return
    setLoading(true)
    try {
      await api.delete(`/api/v1/vendor/rejectApplication/${selectedVendor.uid}`)
      toast({ title: "Rejected", description: `${selectedVendor.vendorLocation.restaurantName} rejected.` })
      setSelectedVendor(null)
      // refresh()
      fetchData()
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to reject vendor", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={Users}
         
          trendUp={true}
        />
        <StatCard
          title="Active Vendors"
          value={dashboardStats.totalVendors}
          icon={Store}
         
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={dashboardStats.totalOrders}
          icon={ShoppingBag}
          trendUp={true}
        />
        
      </div>

      {/* {pendingVendors.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--color-accent)]" />
              <CardTitle>Pending Vendor Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingVendors.map((vendor) => (
                <div key={vendor.uid} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-semibold">{vendor.vendorLocation.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">{vendor.vendorAccount.email}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Pending Review
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

<>
      {pendingVendors.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--color-accent)]" />
              <CardTitle>Pending Vendor Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.uid}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div>
                    <p className="font-semibold">{vendor.vendorLocation.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">{vendor.vendorAccount.email}</p>
                    <p className="text-sm text-muted-foreground">Applied On : {vendor.createdOn}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Pending Review
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-md">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVendor.vendorLocation.restaurantName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {selectedVendor.vendorAccount.email}</p>
                <p><strong>Phone:</strong> {selectedVendor.vendorLocation.phone}</p>
                <p><strong>Address:</strong> {selectedVendor.vendorLocation.address}</p>
                <p><strong>Cuisine:</strong> {selectedVendor.vendorLocation.cuisine}</p>
                <p><strong>Description:</strong> {selectedVendor.vendorLocation.description}</p>
                <p><strong>Opening Hours:</strong> {selectedVendor.vendorLocation.openingHours}</p>
              </div>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                  Close
                </Button>
                <Button variant="destructive" disabled={loading} onClick={handleReject}>
                  Reject
                </Button>
                <Button disabled={loading} onClick={handleApprove}>
                  Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Daily Orders</CardTitle>
          </CardHeader>
          
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Revenue Trend</CardTitle>
          </CardHeader>
          
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "vendor"
                      ? "bg-[var(--color-secondary)]/10"
                      : activity.type === "alert"
                        ? "bg-[var(--color-accent)]/10"
                        : "bg-blue-100"
                  }`}
                >
                  {activity.type === "vendor" ? (
                    <Store className="h-4 w-4 text-[var(--color-secondary)]" />
                  ) : activity.type === "alert" ? (
                    <AlertCircle className="h-4 w-4 text-[var(--color-accent)]" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
