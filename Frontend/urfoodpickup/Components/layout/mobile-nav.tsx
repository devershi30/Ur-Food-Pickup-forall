"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  Home,
  ShoppingBag,
  History,
  User,
  LayoutDashboard,
  ClipboardList,
  MenuIcon,
  Store,
  Users,
  Settings,
} from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const studentNav = [
    { title: "Home", href: "/student", icon: Home },
    { title: "Orders", href: "/student/orders", icon: ShoppingBag },
    { title: "History", href: "/student/history", icon: History },
    { title: "Profile", href: "/student/profile", icon: User },
  ]

  const vendorNav = [
    { title: "Dashboard", href: "/vendor", icon: LayoutDashboard },
    { title: "Orders", href: "/vendor/orders", icon: ClipboardList },
    { title: "Menu", href: "/vendor/menu", icon: MenuIcon },
    { title: "Profile", href: "/vendor/profile", icon: Store },
  ]

  const adminNav = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Vendors", href: "/admin/vendors", icon: Store },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const navItems =
    user?.role === "student" ? studentNav : user?.role === "vendor" ? vendorNav : user?.role === "admin" ? adminNav : []

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-[var(--color-primary)]" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
