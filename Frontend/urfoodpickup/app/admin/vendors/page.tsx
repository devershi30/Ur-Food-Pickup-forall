"use client"

import { useState,useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, CheckCircle, XCircle, Ban, Star } from "lucide-react"
import { mockAdminVendors } from "@/lib/admin-mock-data"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    
      api.get("/api/v1/vendor/listVendors")
      .then((res) => setVendors(res.data))
      .catch((err) => console.error("Error fetching vendors:", err));
  }, []);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.vendorAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendorAccount.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleApprove = (vendorId: string) => {
    // setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status: "active" as const } : v)))
    // toast({
    //   title: "Vendor approved",
    //   description: "The vendor has been approved and can now accept orders",
    // })
  }

  const handleSuspend = (vendorId: string) => {
    // setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status: "suspended" as const } : v)))
    // toast({
    //   title: "Vendor suspended",
    //   description: "The vendor has been suspended",
    //   variant: "destructive",
    // })
  }

  const handleReject = (vendorId: string) => {
    // setVendors((prev) => prev.filter((v) => v.id !== vendorId))
    // toast({
    //   title: "Vendor rejected",
    //   description: "The vendor application has been rejected",
    // })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vendor Management</h1>
        <p className="text-muted-foreground">{vendors.length} vendors registered</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.uid}>
                <TableCell className="font-medium">{vendor.vendorLocation.restaurantName}</TableCell>
                <TableCell>{vendor.vendorLocation.cuisine}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{vendor.vendorAccount.email}</div>
                    <div className="text-muted-foreground">{vendor.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vendor.active ? "default" : vendor.suspended ? "outline" : "secondary"
                    }
                    className={
                      vendor.active
                        ? "bg-[var(--color-secondary)]"
                        : vendor.suspended
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {vendor.active?"Active":"In Active"}
                  </Badge>
                </TableCell>
                <TableCell>{vendor.totalOrders}</TableCell>
                <TableCell>
                  {vendor.rating > -1 ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {vendor.rating}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{vendor.createdOn}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {vendor.active && (
                        <DropdownMenuItem onClick={() => handleSuspend(vendor.id)} className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {vendor.suspended && (
                        <DropdownMenuItem onClick={() => handleApprove(vendor.id)}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No vendors found matching your search</div>
      )}
    </div>
  )
}
