"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?role=vendor")
    } else if (!isLoading && user && user.role !== "vendor") {
      console.log(user)
      var nrole= `/${user.role?.replace("ROLE_", "").toLowerCase()}`;
      if(nrole=="vendor")
      {
        if(user.approved)
          router.push(nrole)
        else {
          if(user.appliedAsVendor)
            router.push("/vendor/waiting")
          else
            router.push("/vendor/apply")
        }
          
      }
      else router.push(nrole)
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-secondary)]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 pb-16 md:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  )
}
