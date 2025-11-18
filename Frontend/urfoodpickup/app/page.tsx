"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Store, Shield } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/${user.role?.replace("ROLE_", "").toLowerCase()}`)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <UtensilsCrossed className="h-16 w-16 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-5xl font-bold text-balance mb-4">
            Welcome to <span className="text-[var(--color-primary)]">UrFoodPickup</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Your campus food delivery solution. Order from local vendors, track your meals in real-time, and enjoy
            delicious food delivered right to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Students</h3>
            <p className="text-muted-foreground mb-4">
              Browse nearby vendors, order your favorite meals, and track deliveries in real-time.
            </p>
            <Button
              onClick={() => router.push("/login?role=student")}
              className="w-full bg-[var(--color-primary)] hover:bg-blue-600"
            >
              Order Now
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-[var(--color-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Vendors</h3>
            <p className="text-muted-foreground mb-4">
              Manage your menu, track orders, and grow your business on campus.
            </p>
            <Button
              onClick={() => router.push("/login?role=vendor")}
              className="w-full bg-[var(--color-secondary)] hover:bg-green-600"
            >
              Vendor Portal
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[var(--color-accent)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Admins</h3>
            <p className="text-muted-foreground mb-4">
              Oversee platform operations, manage users and vendors, view analytics.
            </p>
            <Button
              onClick={() => router.push("/login?role=admin")}
              className="w-full bg-[var(--color-accent)] hover:bg-amber-600"
            >
              Admin Access
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">New to UrFoodPickup?</p>
          <Button variant="outline" size="lg" onClick={() => router.push("/register")}>
            Create an Account
          </Button>
        </div>
      </div>
    </div>
  )
}
