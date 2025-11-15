"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  Home,
  ShoppingBag,
  History,
  User,
  UtensilsCrossed,
  LayoutDashboard,
  ClipboardList,
  MenuIcon,
  BarChart3,
  Users,
  Store,
  Settings,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNav: NavItem[] = [
  { title: "Home", href: "/student", icon: Home },
  { title: "My Orders", href: "/student/orders", icon: ShoppingBag },
  { title: "Order History", href: "/student/history", icon: History },
  { title: "Profile", href: "/student/profile", icon: User },
]

const vendorNav: NavItem[] = [
  { title: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { title: "Orders", href: "/vendor/orders", icon: ClipboardList },
  { title: "Menu", href: "/vendor/menu", icon: MenuIcon },
  { title: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { title: "Profile", href: "/vendor/profile", icon: Store },
]

const VendorWaiting: NavItem[] = [
  { title: "Application Status", href: "/vendor/waiting", icon: LayoutDashboard },
  { title: "New Application", href: "/vendor/apply", icon: ClipboardList },
  
]

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Vendors", href: "/admin/vendors", icon: Store },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const role = user.role?.replace("ROLE_", "").toLowerCase();

  const navItems =
    role === "student" ? studentNav : role === "vendor"?((user.approved) ? vendorNav:VendorWaiting) : role === "admin" ? adminNav : []

  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <UtensilsCrossed className="h-5 w-5 lg:h-6 lg:w-6 text-[var(--color-primary)]" />
          <span className="text-base lg:text-lg">UrFoodPickup</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3 lg:p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 lg:gap-3 rounded-lg px-2 lg:px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="hidden md:inline">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
