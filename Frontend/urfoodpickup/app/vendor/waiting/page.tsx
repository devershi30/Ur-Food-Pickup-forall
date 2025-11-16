"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock, CheckCircle, XCircle } from "lucide-react"


export default function WaitingApprovalPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/api/v1/vendor/listMyApplications")
        setApplications(res.data)
      } catch (err) {
        console.error("Failed to load applications", err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )

  const pending = applications.filter(a => a.applicationStatus !== "PENDINGs")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-3">
            {pending.length > 0 ? (
              <Clock className="h-10 w-10 text-yellow-500" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold">
            {pending.length > 0 ? "Waiting for Approval" : "All Applications Reviewed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700">
          {pending.length > 0 ? (
            <ul className="text-left space-y-3">
              {pending.map((app, i) => (
                <li key={i} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-semibold">{app.vendorLocation.restaurantName}</p>
                  <p className="text-sm text-gray-500">{app.vendorLocation.address}</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Status: {app.applicationStatus}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="h-10 w-10 text-gray-400 mb-2" />
              <p>No pending applications.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
