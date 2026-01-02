import React from "react"
import { Card } from "@/components/ui/card"
import { ShoppingCart, AlertTriangle, CheckCircle, Bell } from "lucide-react"
import { Cart, CartWithPrediction, hasDbPrediction } from "@/types/cart"

interface CartStatsProps {
  totalCarts: number
  activeCarts: number
  maintenanceNeeded: number
  carts?: (Cart | CartWithPrediction)[]
}

export function CartStats({ totalCarts, activeCarts, maintenanceNeeded, carts = [] }: CartStatsProps) {
  // Find carts that need attention soon (high probability of needing maintenance)
  const cartsNeedingAttention = carts.filter(cart => 
    hasDbPrediction(cart) && 
    (cart.maintenance_probability ?? 0) > 0.7 &&
    cart.status === "in_service"
  ) as CartWithPrediction[];

  // Get the cart that needs attention most urgently
  const urgentCart = cartsNeedingAttention.length > 0 
    ? cartsNeedingAttention.sort((a, b) => {
        const daysA = a.days_until_maintenance ?? 999;
        const daysB = b.days_until_maintenance ?? 999;
        return daysA - daysB;
      })[0]
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Carts</p>
              <p className="text-xl font-bold text-foreground">{totalCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Carts</p>
              <p className="text-xl font-bold text-foreground">{activeCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Maintenance</p>
              <p className="text-xl font-bold text-foreground">{maintenanceNeeded}</p>
            </div>
          </div>
        </Card>
      </div>

      {urgentCart && (
        <Card className="p-4 border-l-4 border-l-destructive bg-destructive/10">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-destructive/20 rounded-full">
              <Bell className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-destructive">Preventive Maintenance Alert</p>
              <p className="text-sm text-destructive/80">
                Cart #{urgentCart.asset_tag || urgentCart.qr_token} has a {Math.round((urgentCart.maintenance_probability ?? 0) * 100)}% chance 
                of needing repairs{urgentCart.days_until_maintenance !== null ? ` in ${urgentCart.days_until_maintenance} days` : ''}.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
