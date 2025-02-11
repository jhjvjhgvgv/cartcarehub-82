import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin, AlertTriangle, ScanLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { QRScanner } from "@/components/cart-form/QRScanner";
import { useToast } from "@/hooks/use-toast";

interface CartInfo {
  id: string;
  rfidTag: string;
  status: "active" | "maintenance" | "retired";
  store: string;
  lastMaintenance: string;
  issues: string[];
}

// This would typically come from an API/database
const mockCarts: CartInfo[] = [
  {
    id: "CART-001",
    rfidTag: "QR-123456789",
    status: "active",
    store: "SuperMart Downtown",
    lastMaintenance: "2024-03-15",
    issues: [],
  },
  {
    id: "CART-002",
    rfidTag: "QR-987654321",
    status: "maintenance",
    store: "SuperMart Downtown",
    lastMaintenance: "2024-03-14",
    issues: ["Wheel alignment needed"],
  },
];

const CartStatus = () => {
  const [carts, setCarts] = useState<CartInfo[]>(mockCarts);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

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

  const handleQRCodeDetected = (qrCode: string) => {
    const cart = carts.find(c => c.rfidTag === qrCode);
    if (cart) {
      toast({
        title: "Cart Found",
        description: `Found cart #${cart.id} at ${cart.store}`,
      });
    } else {
      toast({
        title: "Cart Not Found",
        description: "No cart found with this QR code.",
        variant: "destructive",
      });
    }
    setIsScanning(false);
  };

  const handleSubmit = (data: any) => {
    // Placeholder for submit handler
    console.log("Submit data:", data);
  };

  const handleDelete = (cartId: string) => {
    // Placeholder for delete handler
    console.log("Delete cart:", cartId);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your Carts</h1>
            <p className="text-muted-foreground">
              View detailed information about all shopping carts.
            </p>
          </div>
          <Button onClick={() => setIsScanning(true)} className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Scan QR Code
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {carts.map((cart) => (
              <Card key={cart.id} className="flex flex-col">
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
                        <p className="text-sm text-muted-foreground">{cart.rfidTag}</p>
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

        <Dialog open={isScanning} onOpenChange={setIsScanning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Cart QR Code</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <QRScanner 
                onQRCodeDetected={handleQRCodeDetected}
                carts={carts}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
};

export default CartStatus;
