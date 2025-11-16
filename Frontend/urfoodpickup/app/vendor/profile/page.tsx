"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { VendorLocationPicker } from "@/components/map/vendor-location-picker"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import api from "@/lib/axios"
import Image from "next/image"

export default function VendorProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [restaurantName, setRestaurantName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [hours, setHours] = useState("")
  const [location, setLocation] = useState({ lat: 0, lng: 0 })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)


  const [vendor,setVendor] = useState()

 

  

  // fetch vendor profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/v1/vendor/profile")
        const data = res.data

        if (data.vendorLocation) {
          setRestaurantName(data.vendorLocation.restaurantName || "")
          setCuisine(data.vendorLocation.cuisine || "")
          setAddress(data.vendorLocation.address || "")
          setPhone(data.vendorLocation.phone || "")
          setDescription(data.vendorLocation.description || "")
          setHours(data.vendorLocation.openingHours || "")
          // setLocation({
          //   lat: data.vendorLocation.latitude,
          //   lng: data.vendorLocation.longitude,
          // })
          setVendor(data)

        setLocation({ lat: data.vendorLocation.latitude, lng: data.vendorLocation.longitude })
        if (data.vendorLocation)
          setImageUrl(`${api.defaults.baseURL}/api/v1/food-images/download/reference/${data.uid}`)


          console.log(data.vendorLocation)
          console.log(location)
        }
      } catch (err) {
        console.log(err)
        toast({
          title: "Error loading profile",
          description: "Unable to fetch vendor profile details",
          variant: "destructive",
        })
      }
    }
    fetchProfile()
  }, [toast])

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.put("/api/v1/vendor/update", {
        longitude: location.lng,
        latitude: location.lat,
        state: "",
        address,
        restaurantName,
        cuisine,
        description,
        phone,
        openingHours: hours,
      })

      toast({
        title: "Profile updated",
        description: "Your restaurant profile has been updated successfully",
      })
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Could not update vendor profile",
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
    } finally {
      setLoading(false)
    }
  }



  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({ title: "Select an image first", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("file", imageFile)
    try {
      const res = await api.post(`/api/v1/food-images/upload/${vendor.uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const imageId = res.data.data // assuming backend returns image id in data
      setImageUrl(`${api.defaults.baseURL}/api/v1/food-images/download/reference/${vendor.uid}?t=${Date.now()}`)
      toast({ title: "Image updated successfully" })
    } catch (err) {
      console.log(err)
      toast({ title: "Upload failed", description: "Error uploading image.", variant: "destructive" 
      ,className: "bg-red-600 text-white border-none",
    })
    }
  }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>


      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl ? (
            <div className="relative w-40 h-40">
              <Image
                src={imageUrl}
                alt="Restaurant"
                fill
                className="object-cover rounded-lg border"
              />
            </div>
          ) : (
            <div className="w-40 h-40 border rounded-lg flex items-center justify-center text-sm text-muted-foreground">
              No Image
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleImageUpload} className="bg-[var(--color-secondary)]">
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>
      <br></br>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input id="name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Operating Hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location on Map</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorLocationPicker initialLocation={location} onLocationChange={setLocation} />
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[var(--color-secondary)] hover:bg-green-600"
          size="lg"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
