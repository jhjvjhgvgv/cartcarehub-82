import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartInfo {
  id: string;
  status: "active" | "maintenance" | "retired";
  condition: "good" | "fair" | "poor";
  location: string;
  lastUsed: string;
  issues: string[];
}

const CartStatus = () => {
  // This would typically come from an API
  const carts: CartInfo[] = [
    {
      id: "A12345",
      status: "active",
      condition: "good",
      location: "Store Section A",
      lastUsed: "2024-03-15",
      issues: [],
    },
    {
      id: "B67890",
      status: "maintenance",
      condition: "fair",
      location: "Store Section B",
      lastUsed: "2024-03-14",
      issues: ["Wheel alignment needed"],
    },
    {
      id: "C11223",
      status: "active",
      condition: "good",
      location: "Store Section C",
      lastUsed: "2024-03-15",
      issues: [],
    },
  ];

  const getStatusBadge = (status: CartInfo["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      case "retired":
        return <Badge variant="secondary">Retired</Badge>;
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Carts</h1>
          <p className="text-muted-foreground">
            View detailed information about all your shopping carts.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {carts.map((cart) => (
              <Card key={cart.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cart #{cart.id}</CardTitle>
                    {getStatusBadge(cart.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">
                          Last used: {cart.lastUsed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Condition</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {cart.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {cart.location}
                        </p>
                      </div>
                    </div>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </CustomerLayout>
  );
};

export default CartStatus;