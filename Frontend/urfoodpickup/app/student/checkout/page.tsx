"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Clock, CreditCard, Wallet, Navigation } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

type PaymentMethod = "card" | "cash"

interface Coordinates {
  latitude: number
  longitude: number
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup")
  const [notes, setNotes] = useState("")
  const [isPlacing, setIsPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  
  // Card details
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  const deliveryFee = orderType === "delivery" ? 2.99 : 0
  const tax = total * 0.08
  const finalTotal = total + deliveryFee + tax

  // Get user's current location on mount if delivery is selected
  useEffect(() => {
    if (orderType === "delivery" && !coordinates) {
      getCurrentLocation()
    }
  }, [orderType])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setCoordinates(coords)
        setIsLoadingLocation(false)
        
        // Reverse geocode to get address (optional)
        reverseGeocode(coords.latitude, coords.longitude)
        
        toast({
          title: "Location obtained",
          description: "Your current location has been set",
        })
      },
      (error) => {
        setIsLoadingLocation(false)
        console.error("Geolocation error:", error)
        
        let errorMessage = "Unable to get your location"
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable location access."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable"
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out"
        }
        
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setDeliveryAddress(address)
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
      // Fallback to coordinates
      setDeliveryAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handlePlaceOrder = async () => {
    // Validation
    if (orderType === "delivery") {
      if (!coordinates) {
        toast({
          title: "Location required",
          description: "Please allow location access or enter your coordinates",
          variant: "destructive",
        })
        return
      }
      
      if (!deliveryAddress.trim()) {
        toast({
          title: "Delivery address required",
          description: "Please enter your delivery address",
          variant: "destructive",
        })
        return
      }
    }

    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast({
          title: "Card details required",
          description: "Please fill in all card details",
          variant: "destructive",
        })
        return
      }

      // Basic validation
      const cleanCardNumber = cardNumber.replace(/\s/g, "")
      if (cleanCardNumber.length < 15) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid card number",
          variant: "destructive",
        })
        return
      }
    }

    setIsPlacing(true)

    try {
      // Step 1: Create the order
      const orderPayload = {
        orderType: orderType.toUpperCase(),
        deliveryLocation: orderType === "delivery" && coordinates ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        } : null,
        specialInstructions: notes || null,
        items: items.map(item => ({
          foodItemId: item.uid,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const orderResponse = await api.post("/api/v1/orders", orderPayload)
      const orderId = orderResponse.data.uid

      // Step 2: Process payment
      if (paymentMethod === "card") {
        const paymentPayload = {
          orderId,
          amount: finalTotal,
          currency: "USD",
          paymentMethod: "CARD",
          cardDetails: {
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiryMonth: cardExpiry.split("/")[0],
            expiryYear: cardExpiry.split("/")[1],
            cvc: cardCvc,
            cardHolderName: cardName
          }
        }

        const paymentResponse = await api.post("/api/v1/payments/process", paymentPayload)

        if (paymentResponse.data.status === "SUCCESS") {
          clearCart()
          toast({
            title: "Payment successful!",
            description: "Your order has been placed successfully",
          })
          router.push(`/student/orders`)
        } else {
          toast({
            title: "Payment failed",
            description: paymentResponse.data.message || "Please check your card details and try again",
            variant: "destructive",
            className: "bg-red-600 text-white border-none",
          })
          setIsPlacing(false)
        }

      } else if (paymentMethod === "cash") {
        // Cash on delivery/pickup
        const paymentPayload = {
          orderId,
          amount: finalTotal,
          paymentMethod: "CASH"
        }

        await api.post("/api/v1/payments/process", paymentPayload)

        clearCart()
        toast({
          title: "Order placed successfully!",
          description: "Pay with cash when you receive your order",
        })
        router.push(`/student/orders`)
      }

    } catch (error: any) {
      console.error("Order placement failed:", error)
      toast({
        title: "Order failed",
        description: error.response?.data?.message || "Failed to place order. Please try again.",
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
      setIsPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/student")}>Browse Vendors</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-3 sm:mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <div className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium text-sm sm:text-base">Pickup</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Pick up from vendor location</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium text-sm sm:text-base">Delivery</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Deliver to your location (+$2.99)</p>
                  </Label>
                </div>
              </RadioGroup>

              {orderType === "delivery" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., Main Campus, Room 204"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className="flex-1"
                    >
                      <Navigation className={`h-4 w-4 mr-2 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                      {isLoadingLocation ? "Getting location..." : "Use My Current Location"}
                    </Button>
                  </div>

                  {coordinates && (
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground mb-1">📍 Location Coordinates:</p>
                      <p className="font-mono text-xs">
                        Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm sm:text-base">Credit/Debit Card</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Pay securely with your card</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium text-sm sm:text-base">Cash</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Pay with cash on {orderType === "delivery" ? "delivery" : "pickup"}
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-1">Test Mode - Use these test cards:</p>
                    <p className="text-xs text-blue-700">✓ Success: 4242 4242 4242 4242</p>
                    <p className="text-xs text-blue-700">✗ Decline: 4000 0000 0000 0002</p>
                    <p className="text-xs text-blue-700">Expiry: Any future date | CVC: Any 3 digits</p>
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        maxLength={4}
                        type="text"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.uid} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image 
                      src={`${api.defaults.baseURL}/api/v1/food-images/download/reference/${item.uid}` || "/placeholder.svg"} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.vendor?.vendorLocation?.restaurantName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-semibold text-[var(--color-primary)]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any special requests or dietary restrictions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-sm sm:text-base"
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="md:sticky md:top-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-[var(--color-primary)]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full bg-[var(--color-primary)] hover:bg-blue-600"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacing}
              >
                {isPlacing ? "Processing..." : paymentMethod === "card" ? "Pay Now" : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}