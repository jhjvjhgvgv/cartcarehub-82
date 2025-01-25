import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin } from "lucide-react";

const CartStatus = () => {
  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cart Status</h1>
          <p className="text-muted-foreground">
            View detailed information about your shopping cart.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cart #A12345</CardTitle>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">In Use</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Condition</p>
                  <p className="text-sm text-muted-foreground">Good</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">Store Section A</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No maintenance history to display.</p>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CartStatus;