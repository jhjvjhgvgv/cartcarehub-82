
import { Cart } from "@/types/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin, AlertTriangle, History } from "lucide-react";
import { MaintenanceAction } from "@/components/carts/MaintenanceAction";
import { ActivateAction } from "@/components/carts/ActivateAction";

interface CartCardProps {
  cart: Cart;
  onStatusChange: (cart: Cart) => void;
}

export function CartCard({ cart, onStatusChange }: CartCardProps) {
  const getStatusBadge = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      case "retired":
        return <Badge variant="secondary">Retired</Badge>;
    }
  };

  // Count maintenance events
  const maintenanceCount = cart.maintenance_history?.length || 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cart #{cart.id}</CardTitle>
          {getStatusBadge(cart.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Store</p>
              <p className="text-sm text-muted-foreground">{cart.store}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Last Maintenance</p>
              <p className="text-sm text-muted-foreground">{cart.lastMaintenance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">QR Code</p>
              <p className="text-sm text-muted-foreground">{cart.qr_code}</p>
            </div>
          </div>
          {maintenanceCount > 0 && (
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Maintenance History</p>
                <p className="text-sm text-muted-foreground">{maintenanceCount} record{maintenanceCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
          {cart.issues.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium">Issues</p>
                <ul className="text-sm text-destructive list-disc list-inside">
                  {cart.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Status action buttons */}
          <div className="flex justify-end gap-2 mt-2">
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
