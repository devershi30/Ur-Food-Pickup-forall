"use client"

import { useState,useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Ban, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    api
      .get("/api/v1/admin/allUsers")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);


  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSuspend = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "suspended" as const } : u)))
    toast({
      title: "User suspended",
      description: "The user account has been suspended",
      variant: "destructive",
    })
  }

  const handleReactivate = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "active" as const } : u)))
    toast({
      title: "User reactivated",
      description: "The user account has been reactivated",
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">{users.length} users registered</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.name} ({user.username})</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role?.replace("ROLE_", "").toLowerCase()}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.appliedAsVendor ? "default" : "secondary"}
                    className={user.status === "active" ? "bg-[var(--color-secondary)]" : "bg-red-100 text-red-800"}
                  >
                    {user.appliedAsVendor?user.approved?"Approved":"Not Approved":"Active"}
                  </Badge>
                </TableCell>
                <TableCell>{0}</TableCell>
                <TableCell>{user.createdOn}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!false? (
                        <DropdownMenuItem onClick={() => handleSuspend(user.uid)} className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReactivate(user.uid)}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Reactivate Account
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No users found matching your search</div>
      )}
    </div>
  )
}
