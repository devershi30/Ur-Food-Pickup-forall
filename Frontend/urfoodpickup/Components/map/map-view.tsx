"use client"

import { useEffect, useRef, useState } from "react"

interface Vendor {
  uid: string
  active: boolean
  rating: number
  distance: number
  vendorLocation: {
    latitude: number
    longitude: number
    restaurantName: string
    cuisine: string
  }
}

interface MapViewProps {
  vendors: Vendor[]
  userLocation?: { lat: number; lng: number }
  onVendorClick?: (vendorId: string) => void
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
}

export function MapView({
  vendors,
  userLocation,
  onVendorClick,
  center,
  zoom = 14,
  height = "500px",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(userLocation || null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // If no coords provided, get current position
    if (!coords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setCoords({ lat: latitude, lng: longitude })
        },
        (err) => console.error("Error getting location:", err)
      )
      return // wait for coords before initializing map
    }

    import("leaflet").then((L) => {
      // cleanup any existing map
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          console.error("Error removing map:", e)
        }
      }

      // Fix "Map container is already initialized" issue
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }

      const mapCenter = center || coords
      const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], zoom)
      mapInstanceRef.current = map

      // Base layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // User marker
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      L.marker([coords.lat, coords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Location</b>")

      // Vendor markers
      vendors.forEach((vendor) => {
        const vendorIcon = L.divIcon({
          className: "custom-vendor-marker",
          html: `<div style="background:${
            vendor.active ? "#10b981" : "#6b7280"
          };width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">🍽️</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker(
          [vendor.vendorLocation.latitude, vendor.vendorLocation.longitude],
          { icon: vendorIcon }
        ).addTo(map)

        marker.bindPopup(`
          <div style="min-width:200px;">
            <h3 style="font-weight:bold;margin-bottom:4px;">${vendor.vendorLocation.restaurantName}</h3>
            <p style="color:#6b7280;font-size:14px;margin-bottom:4px;">${vendor.vendorLocation.cuisine}</p>
            <p style="font-size:14px;margin-bottom:4px;">⭐ ${vendor.rating} • ${vendor.distance} km</p>
            <p style="font-size:14px;color:${
              vendor.active ? "#10b981" : "#6b7280"
            };font-weight:600;">
              ${vendor.active ? "Open" : "Closed"}
            </p>
          </div>
        `)

        if (onVendorClick) {
          marker.on("click", () => onVendorClick(vendor.uid))
        }
      })

      // Radius circle
      L.circle([coords.lat, coords.lng], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        radius: 1000,
      }).addTo(map)
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
    }
  }, [coords, vendors, userLocation, onVendorClick, center, zoom])

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <div ref={mapRef} style={{ height, width: "100%" }} className="w-full h-full" />
    </div>
  )
}
