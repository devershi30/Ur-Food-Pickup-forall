"use client"

import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/lib/websocket-context"
import { Button } from "@/components/ui/button"
import { Bell, User, LogOut, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function Topbar() {
  const { user, logout } = useAuth()
  const { orderUpdates } = useWebSocket()

  const recentUpdates = orderUpdates.filter((update) => Date.now() - update.timestamp.getTime() < 5 * 60 * 1000).length

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <h2 className="text-sm md:text-lg font-semibold truncate">
            {user?.role === "student" && <span className="hidden sm:inline">Browse & Order</span>}
            {user?.role === "student" && <span className="sm:hidden">Home</span>}
            {user?.role === "vendor" && <span className="hidden sm:inline">Vendor Dashboard</span>}
            {user?.role === "vendor" && <span className="sm:hidden">Dashboard</span>}
            {user?.role === "admin" && <span className="hidden sm:inline">Admin Portal</span>}
            {user?.role === "admin" && <span className="sm:hidden">Admin</span>}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {recentUpdates > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-[var(--color-accent)] text-[10px]">
                {recentUpdates}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
