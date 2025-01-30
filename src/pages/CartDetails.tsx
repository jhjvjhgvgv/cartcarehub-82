import React from "react"
import { useParams } from "react-router-dom"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// This would typically come from an API call using the cartId
const getCartDetails = (cartId: string) => {
  // Mock data - in a real app, this would be fetched from an API
  return {
    id: cartId,
    rfidTag: "RFID-A123",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "active" as const,
    lastMaintenance: "2024-02-15",
    issues: ["Wheel alignment needed"],
  }
}

export default function CartDetails() {
  const { cartId } = useParams()
  const cart = getCartDetails(cartId || "")

  const getStatusBadge = (status: "active" | "maintenance" | "retired") => {
    const statusStyles = {
      active: "bg-green-500",
      maintenance: "bg-yellow-500",
      retired: "bg-red-500",
    }

    return (
      <Badge className={`${statusStyles[status]} text-white px-4 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Cart Details</h1>
          <Card>
            <CardHeader>
              <CardTitle>Cart Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">RFID Tag</p>
                  <p className="text-lg">{cart.rfidTag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Store</p>
                  <p className="text-lg">{cart.store}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(cart.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Maintenance</p>
                  <p className="text-lg">{cart.lastMaintenance}</p>
                </div>
              </div>
              {cart.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Issues</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {cart.issues.map((issue, index) => (
                      <li key={index} className="text-gray-700">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}