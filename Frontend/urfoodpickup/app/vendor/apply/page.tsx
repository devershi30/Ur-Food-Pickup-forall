"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useRouter } from "next/navigation"
import { VendorLocationPicker } from "@/components/map/vendor-location-picker"
import api from "@/lib/axios"
import { useAuth } from "@/lib/auth-context"

export default function ApplyAsVendorPage() {

    const { refresh } = useAuth()

  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    restaurantName: "",
    cuisine: "",
    address: "",
    phone: "",
    description: "",
    openingHours: "",
    latitude: 0,
    longitude: 0,
    state: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post("/api/v1/vendor/applyAsVendor", form)
      refresh();
      toast({ title: "Application submitted", description: "Vendor application successful!" })
      router.push("/vendor")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Could not apply as vendor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Apply as Vendor</h1>
      <Card>
        <CardHeader><CardTitle>Vendor Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input id="restaurantName" value={form.restaurantName} onChange={handleChange} />
          </div>
          <div><Label htmlFor="cuisine">Cuisine</Label>
            <Input id="cuisine" value={form.cuisine} onChange={handleChange} />
          </div>
          <div><Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={handleChange} />
          </div>
          <div><Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={handleChange} />
          </div>
          <div><Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div><Label htmlFor="openingHours">Opening Hours</Label>
            <Input id="openingHours" value={form.openingHours} onChange={handleChange} />
          </div>
          <div>
            <Label>Location</Label>
            <VendorLocationPicker
              initialLocation={{ lat: form.latitude, lng: form.longitude }}
              onLocationChange={(loc) => setForm({ ...form, latitude: loc.lat, longitude: loc.lng })}
            />
          </div>
          <Button className="w-full bg-[var(--color-secondary)] hover:bg-green-600" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
