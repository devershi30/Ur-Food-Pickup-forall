"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [orderTimeout, setOrderTimeout] = useState("30")
  const [defaultRadius, setDefaultRadius] = useState("5")
  const [autoApproveVendors, setAutoApproveVendors] = useState(false)

  // Fetch settings from backend on load
  useEffect(() => {
    api
      .get("/api/v1/admin/settings")
      .then((res) => {
        const data = res.data
        setOrderTimeout(data.orderTimeout.toString())
        setDefaultRadius(data.defaultRadius.toString())
        setAutoApproveVendors(data.autoApproveVendors)
      })
      .catch(() => {
        toast({
          title: "Failed to load settings",
          description: "Please try again later",
          variant: "destructive",
        })
      })
  }, [])

  // Save settings
  const handleSave = async () => {
    try {
      await api.put("/api/v1/admin/settings", {
        orderTimeout: parseInt(orderTimeout),
        defaultRadius: parseFloat(defaultRadius),
        autoApproveVendors,
      })
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully",
      })
    } catch (err) {
      toast({
        title: "Failed to save settings",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
            <CardDescription>Configure order-related parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Order Timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                value={orderTimeout}
                onChange={(e) => setOrderTimeout(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Time before an order is automatically cancelled if not accepted
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Default Search Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Default radius for vendor search</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Settings</CardTitle>
            <CardDescription>Configure vendor management options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-approve">Auto-approve Vendors</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new vendor registrations
                </p>
              </div>
              <Switch
                id="auto-approve"
                checked={autoApproveVendors}
                onCheckedChange={setAutoApproveVendors}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full bg-[var(--color-accent)] hover:bg-amber-600"
          size="lg"
        >
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
