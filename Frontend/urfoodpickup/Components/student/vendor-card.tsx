import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Vendor } from "@/lib/mock-data"
import api from "@/lib/axios"

interface VendorCardProps {
  vendor: Vendor
}

// src={
//   item?.uid
//     ? `/api/v1/food-images/download/reference/${item.uid}`
//     : "/placeholder.svg?height=200&width=300&query=food+item"
// }

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  const hours = (seconds / 3600).toFixed(1);
  return `${hours} hr`;
}


export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Link href={`/student/vendor/${vendor.uid}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-40 w-full">
          <Image 
          
          src={vendor?.uid?`${api.defaults.baseURL}/api/v1/food-images/download/reference/${vendor.uid}` : "/placeholder.svg"} alt={vendor.vendorLocation.restaurantName} 
          
          fill className="object-cover" />
          {vendor.suspended && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Closed
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{vendor.vendorLocation.name}</h3>
              <p className="text-sm text-muted-foreground">{vendor.cuisine}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {vendor.rating}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(vendor.deliveryTime)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {formatDistance(vendor.distance)}
            </div>
          </div>

        </CardContent>
      </Card>
    </Link>
  )
}
