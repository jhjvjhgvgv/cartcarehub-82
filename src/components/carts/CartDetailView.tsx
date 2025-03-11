
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cart } from "@/types/cart"

interface CartDetailViewProps {
  cart: Cart
}

export function CartDetailView({ cart }: CartDetailViewProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Cart Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">QR Code</p>
            <p className="text-lg">{cart.qr_code}</p>
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
  )
}
