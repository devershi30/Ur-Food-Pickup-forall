"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MenuItemCard } from "@/components/student/menu-item-card"
import { CartSheet } from "@/components/student/cart-sheet"
import { useCart } from "@/lib/cart-context"
import { mockMenuItems } from "@/lib/mock-data"
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()

  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menus,setMenus] = useState()

  const [error, setError] = useState(null)

  const handleAddToCart = (item: any,menu: any) => {
    item.vendor = menu.vendor
    addItem(item)
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    })
  }

  const formatDistance = (meters: number) => {
    if (!meters && meters !== 0) return "--"
    return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
  }

  const formatTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return "--"
    if (seconds < 60) return `${Math.round(seconds)} s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`
    return `${(seconds / 3600).toFixed(1)} hr`
  }

  useEffect(() => {
    let mounted = true
    let cancelled = false

    setLoading(true)
    api
      .get(`/api/v1/vendor/viewVendor/${id}`)
      .then((res) => {
        if (mounted) setVendor(res.data)
      })
      .catch((err) => console.error("Error fetching vendor:", err))
      .finally(() => mounted && setLoading(false))


      const fetchMenus = async () => {
        setLoading(true)
        
        try {
          const res = await api.get(`/api/v1/menu/vendorMenus/${id}`)
          if (!cancelled) {
            // Expecting res.data to be an array of Menu objects
            setMenus(Array.isArray(res.data) ? res.data : [])
          }
        } catch (err: any) {
          if (!cancelled) setError(err?.message || "Failed to load menus")
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
  
      fetchMenus();



    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading vendor details...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <p>Vendor not found</p>
      </div>
    )
  }


  if (loading) return <p className="text-center py-8">Loading menu...</p>
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>

  // If API returns no menus or menus with empty menuFoodList
  const totalItems = menus?.reduce(
    (acc, m) => acc + (Array.isArray(m.menuFoodList) ? m.menuFoodList.length : 0),
    0
  )||0

  return (
    <div className="pb-6">
      <div className="relative h-64 w-full">
        <Image
          src={
            vendor?.uid
              ? `${api.defaults.baseURL}/api/v1/food-images/download/reference/${vendor.uid}`
              : "/placeholder.svg"
          }
          alt={vendor?.vendorLocation?.restaurantName || "Restaurant Image"}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4">
          <CartSheet />
        </div>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            {vendor?.vendorLocation?.restaurantName || "Unnamed Restaurant"}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {vendor?.rating ?? "--"}
            </Badge>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(vendor?.deliveryTime)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {formatDistance(vendor?.distance)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Menu</h2>
            <p className="text-muted-foreground">{totalItems} items available</p>
          </div>

          {menus?.length == 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No menus available</p>
            </div>
          )}

          <div className="space-y-8">
            {menus?.map((menu) => (
              <section key={menu.uid || menu.id || menu.title}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{menu.title || "Menu"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(menu.menuFoodList) ? menu.menuFoodList.length : 0} items
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.isArray(menu.menuFoodList) && menu.menuFoodList.length > 0 ? (
                    menu.menuFoodList.map((food) => (
                      <MenuItemCard key={food.uid || food.id || `${menu.uid}-${food.name}`} item={food} onAdd={() => handleAddToCart(food,menu)} />
                    ))
                  ) : (
                    <div className="col-span-full text-muted-foreground">No items in this menu</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>




    </div>
  )
}
