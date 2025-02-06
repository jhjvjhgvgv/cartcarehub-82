import React from "react"
import { useParams } from "react-router-dom"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cart } from "@/types/cart"

// This would typically come from an API call using the cartId
const getCartDetails = (cartId: string): Cart => {
  // Mock data - in a real app, this would be fetched from an API
  const mockCarts: Cart[] = [
    {
      id: "CART-001",
      rfidTag: "RFID-A123",
      store: "SuperMart Downtown",
      storeId: "store1",
      status: "active",
      lastMaintenance: "2024-02-15",
      issues: ["Wheel alignment needed"],
    },
    {
      id: "CART-002",
      rfidTag: "RFID-B456",
      store: "SuperMart Downtown",
      storeId: "store1",
      status: "maintenance",
      lastMaintenance: "2024-01-20",
      issues: ["Handle loose", "Left wheel damaged"],
    },
    {
      id: "CART-003",
      rfidTag: "RFID-C789",
      store: "FreshMart Heights",
      storeId: "store2",
      status: "active",
      lastMaintenance: "2024-02-10",
      issues: [],
    },
    {
      id: "CART-004",
      rfidTag: "RFID-D012",
      store: "FreshMart Heights",
      storeId: "store2",
      status: "retired",
      lastMaintenance: "2024-01-05",
      issues: ["Frame damage", "Beyond repair"],
    },
    {
      id: "CART-005",
      rfidTag: "RFID-E345",
      store: "Value Grocery West",
      storeId: "store3",
      status: "active",
      lastMaintenance: "2024-02-20",
      issues: [],
    },
    {
      id: "CART-006",
      rfidTag: "RFID-F678",
      store: "Value Grocery West",
      storeId: "store3",
      status: "maintenance",
      lastMaintenance: "2024-02-01",
      issues: ["Squeaky wheel"],
    },
    {
      id: "CART-007",
      rfidTag: "RFID-G901",
      store: "SuperMart Downtown",
      storeId: "store1",
      status: "active",
      lastMaintenance: "2024-02-18",
      issues: [],
    },
    {
      id: "CART-008",
      rfidTag: "RFID-H234",
      store: "FreshMart Heights",
      storeId: "store2",
      status: "active",
      lastMaintenance: "2024-02-17",
      issues: [],
    },
    {
      id: "CART-009",
      rfidTag: "RFID-I567",
      store: "Value Grocery West",
      storeId: "store3",
      status: "active",
      lastMaintenance: "2024-02-19",
      issues: [],
    },
  ]

  const cart = mockCarts.find(cart => cart.id === cartId)
  if (!cart) {
    throw new Error(`Cart with ID ${cartId} not found`)
  }
  return cart
}

export default function CartDetails() {
  const { cartId } = useParams<{ cartId: string }>()
  const cart = cartId ? getCartDetails(cartId) : null

  if (!cart) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">Cart not found</div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: Cart["status"]) => {
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
                  <p className="text-sm font-medium text-gray-500">QR Code</p>
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
              {cart.issues && cart.issues.length > 0 && (
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