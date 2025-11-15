"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface VendorLocationPickerProps {
  initialLocation?: { lat: number; lng: number }
  onLocationChange?: (location: { lat: number; lng: number }) => void
  height?: string
}

export function VendorLocationPicker({
  initialLocation = { lat: 40.7128, lng: -74.006 },
  onLocationChange,
  height = "400px",
}: VendorLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [currentLocation, setCurrentLocation] = useState(initialLocation)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    import("leaflet").then((L) => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          console.error("Error removing map:", e)
        }
      }

      // Check if the container has _leaflet_id (indicates Leaflet is still attached)
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }

      const map = L.map(mapRef.current).setView([initialLocation.lat, initialLocation.lng], 15)
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Create draggable marker
      const vendorIcon = L.divIcon({
        className: "custom-vendor-marker",
        html: `<div style="background: #10b981; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📍</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        icon: vendorIcon,
        draggable: true,
      }).addTo(map)

      markerRef.current = marker

      marker.on("dragend", () => {
        const position = marker.getLatLng()
        const newLocation = { lat: position.lat, lng: position.lng }
        setCurrentLocation(newLocation)
        if (onLocationChange) {
          onLocationChange(newLocation)
        }
      })

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng)
        const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng }
        setCurrentLocation(newLocation)
        if (onLocationChange) {
          onLocationChange(newLocation)
        }
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          console.error("Error cleaning up map:", e)
        }
      }
      if (markerRef.current) {
        markerRef.current = null
      }
    }
  }, [initialLocation.lat, initialLocation.lng])

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(newLocation)
          if (onLocationChange) {
            onLocationChange(newLocation)
          }
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 15)
            markerRef.current.setLatLng([newLocation.lat, newLocation.lng])
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <p>Drag the marker or click on the map to set your location</p>
          <p className="mt-1">
            Current: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleUseCurrentLocation}>
          <MapPin className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
      </div>
      <div className="relative rounded-lg overflow-hidden border">
        <div ref={mapRef} style={{ height, width: "100%" }} />
      </div>
    </div>
  )
}
