"use client"

import { useState,useEffect } from "react"
import { VendorCard } from "@/components/student/vendor-card"
import { CartSheet } from "@/components/student/cart-sheet"
import { MapView } from "@/components/map/map-view"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, SlidersHorizontal, Map, List } from "lucide-react"
import { useRouter } from "next/navigation"

import api from "@/lib/axios"

export default function StudentHomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState("all")
  const [sortBy, setSortBy] = useState("distance")
  const router = useRouter()

  const [vendors,setVendors] =  useState([])
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    
    // api.get("/api/v1/vendor/listVendors")
    // .then((res) => setVendors(res.data))
    // .catch((err) => console.error("Error fetching vendors:", err));


    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        api
          .get(`/api/v1/vendor/listActiveVendorsClose`, {
            params: { lat: latitude, lng: longitude },
          })
          .then((res) => setVendors(res.data))
          .catch((err) => console.error("Error fetching vendors:", err));
      },
      (err) => {
        console.error("Location access denied:", err);
        // fallback (optional)
        api
          .get(`/api/v1/vendor/listActiveVendorsClose`, {
            params: { lat: 0, lng: 0 },
          })
          .then((res) => setVendors(res.data));
      }
    );


  }, []);




  const cuisines = ["all", ...Array.from(new Set(vendors.map((v) => v.vendorLocation.cuisine)))]

  const filteredVendors = vendors
    .filter((vendor) => {
      const matchesSearch = vendor.vendorLocation.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCuisine = cuisineFilter === "all" || vendor.vendorLocation.cuisine === cuisineFilter
      return matchesSearch && matchesCuisine
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance
      if (sortBy === "rating") return b.rating - a.rating
      return 0
    })

  const handleVendorClick = (vendorId: string) => {
    router.push(`/student/vendor/${vendorId}`)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Nearby Vendors</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Campus Area</span>
          </div>
        </div>
        <CartSheet />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine === "all" ? "All Cuisines" : cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="list" className="flex-1 sm:flex-none flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1 sm:flex-none flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Map View</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.uid} vendor={vendor} />
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No vendors found matching your criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[600px]">
              <MapView vendors={filteredVendors} onVendorClick={handleVendorClick} 
              className="w-full h-full"
              
              />
            </div>
            <div className="space-y-4 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.uid} vendor={vendor} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
