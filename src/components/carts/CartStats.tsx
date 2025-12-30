
import React from "react"
import { Card } from "@/components/ui/card"
import { ShoppingCart, AlertTriangle, CheckCircle, Bell } from "lucide-react"
import { Cart, CartWithPrediction } from "@/types/cart"

interface CartStatsProps {
  totalCarts: number
  activeCarts: number
  maintenanceNeeded: number
  carts?: (Cart | CartWithPrediction)[]
}

export function CartStats({ totalCarts, activeCarts, maintenanceNeeded, carts = [] }: CartStatsProps) {
  // Find carts that need attention soon (high probability of needing maintenance)
  const cartsNeedingAttention = carts.filter(
    cart => 'maintenance_probability' in cart && 
    cart.maintenance_probability && 
    cart.maintenance_probability > 0.7 &&
    cart.status === "in_service"
  ) as CartWithPrediction[];

  // Get the cart that needs attention most urgently
  const urgentCart = cartsNeedingAttention.length > 0 
    ? cartsNeedingAttention.sort((a, b) => 
        (a.days_until_maintenance || 999) - 
        (b.days_until_maintenance || 999)
      )[0]
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-full">
              <ShoppingCart className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Carts</p>
              <p className="text-xl font-bold text-gray-900">{totalCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Carts</p>
              <p className="text-xl font-bold text-gray-900">{activeCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs Maintenance</p>
              <p className="text-xl font-bold text-gray-900">{maintenanceNeeded}</p>
            </div>
          </div>
        </Card>
      </div>

      {urgentCart && (
        <Card className="p-4 border-l-4 border-l-red-600 bg-red-50">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Bell className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Preventive Maintenance Alert</p>
              <p className="text-sm text-red-700">
                Cart #{urgentCart.asset_tag || urgentCart.qr_token} has a {Math.round((urgentCart.maintenance_probability || 0) * 100)}% chance 
                of needing repairs in {urgentCart.days_until_maintenance} days.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
