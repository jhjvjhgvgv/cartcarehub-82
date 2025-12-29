import { Cart, CartWithStore, getStatusLabel } from "@/types/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MapPin, RotateCw, FileText } from "lucide-react";
import { MaintenanceAction } from "@/components/carts/MaintenanceAction";
import { ActivateAction } from "@/components/carts/ActivateAction";
import { CartStatusBadge } from "@/components/carts/CartStatusBadge";

interface CartCardProps {
  cart: Cart | CartWithStore;
  onStatusChange: (cart: Cart) => void;
}

export function CartCard({ cart, onStatusChange }: CartCardProps) {
  // Determine card styling based on status
  const getCardBorderColor = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "border-l-4 border-l-green-500";
      case "out_of_service":
        return "border-l-4 border-l-yellow-500";
      case "retired":
        return "border-l-4 border-l-red-500";
    }
  };

  // Get a gradient background based on cart status
  const getCardBackground = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "bg-gradient-to-br from-background to-green-50 dark:to-green-950/20";
      case "out_of_service":
        return "bg-gradient-to-br from-background to-yellow-50 dark:to-yellow-950/20";
      case "retired":
        return "bg-gradient-to-br from-background to-red-50 dark:to-red-950/20";
    }
  };

  const getStatusColor = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "text-green-500";
      case "out_of_service":
        return "text-yellow-500";
      case "retired":
        return "text-red-500";
    }
  };

  // Get store name from CartWithStore if available
  const storeName = 'store_name' in cart ? cart.store_name : cart.store_org_id;

  return (
    <Card className={`flex flex-col transition-all duration-300 hover:shadow-md ${getCardBorderColor(cart.status)} ${getCardBackground(cart.status)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ShoppingCart className={`h-5 w-5 mr-2 ${getStatusColor(cart.status)}`} />
            {cart.asset_tag || `Cart #${cart.id.slice(0, 8)}`}
          </CardTitle>
          <CartStatusBadge status={cart.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Store</p>
              <p className="text-sm text-muted-foreground">{storeName || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <RotateCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">QR Token</p>
              <p className="text-sm text-muted-foreground font-mono">{cart.qr_token}</p>
            </div>
          </div>
          {cart.model && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Model</p>
                <p className="text-sm text-muted-foreground">{cart.model}</p>
              </div>
            </div>
          )}
          
          {/* Status action buttons */}
          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-border/50">
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
