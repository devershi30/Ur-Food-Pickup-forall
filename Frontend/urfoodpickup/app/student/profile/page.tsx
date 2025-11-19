"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const { toast } = useToast()

  const [username, setUsername] = useState(user?.username || "")
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error,setError] = useState("")

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.put("/api/v1/auth/update", {
        username,
        name,
        email,
      })
      await refresh?.()
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (err: any) {
      setError(err.response.data)
      toast({
        title: "Update failed",
        description: err.response?.data || err.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password must match.",
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
      return
    }

    try {
      setLoading(true)
      await api.put("/api/v1/auth/changePassword", {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.response.data)
      toast({
        title: "Password change failed",
        description: err.response?.data || err.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-none",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[var(--color-primary)] hover:bg-blue-600"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><pre className=" danger">{error}</pre></p>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handlePasswordChange}
            disabled={loading}
            className="bg-[var(--color-primary)] hover:bg-blue-600"
          >
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
