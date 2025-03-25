
import { Cart } from "@/types/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin, AlertTriangle, History, RotateCw } from "lucide-react";
import { MaintenanceAction } from "@/components/carts/MaintenanceAction";
import { ActivateAction } from "@/components/carts/ActivateAction";
import { CartStatusBadge } from "@/components/carts/CartStatusBadge";

interface CartCardProps {
  cart: Cart;
  onStatusChange: (cart: Cart) => void;
}

export function CartCard({ cart, onStatusChange }: CartCardProps) {
  // Count maintenance events
  const maintenanceCount = cart.maintenance_history?.length || 0;

  // Determine card styling based on status
  const getCardBorderColor = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return "border-l-4 border-l-green-500";
      case "maintenance":
        return "border-l-4 border-l-yellow-500";
      case "retired":
        return "border-l-4 border-l-red-500";
    }
  };

  // Get a gradient background based on cart status
  const getCardBackground = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-br from-white to-green-50";
      case "maintenance":
        return "bg-gradient-to-br from-white to-yellow-50";
      case "retired":
        return "bg-gradient-to-br from-white to-red-50";
    }
  };

  return (
    <Card className={`flex flex-col transition-all duration-300 hover:shadow-md ${getCardBorderColor(cart.status)} ${getCardBackground(cart.status)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ShoppingCart className={`h-5 w-5 mr-2 ${cart.status === 'active' ? 'text-green-500' : cart.status === 'maintenance' ? 'text-yellow-500' : 'text-red-500'}`} />
            Cart #{cart.id}
          </CardTitle>
          <CartStatusBadge status={cart.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-50 rounded-full">
              <MapPin className="h-4 w-4 text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Store</p>
              <p className="text-sm text-muted-foreground">{cart.store}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-50 rounded-full">
              <Battery className="h-4 w-4 text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-medium">Last Maintenance</p>
              <p className="text-sm text-muted-foreground">{cart.lastMaintenance || 'Never'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-50 rounded-full">
              <RotateCw className="h-4 w-4 text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-medium">QR Code</p>
              <p className="text-sm text-muted-foreground">{cart.qr_code}</p>
            </div>
          </div>
          {maintenanceCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-50 rounded-full">
                <History className="h-4 w-4 text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Maintenance History</p>
                <p className="text-sm text-muted-foreground">{maintenanceCount} record{maintenanceCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
          {cart.issues.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-red-50 rounded-full mt-0.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600">Issues</p>
                <ul className="text-sm text-red-500 list-disc list-inside">
                  {cart.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Status action buttons */}
          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
            <MaintenanceAction 
              cart={cart} 
              onEdit={onStatusChange} 
              disabled={false}
            />
            <ActivateAction 
              cart={cart} 
              onEdit={onStatusChange} 
              disabled={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
