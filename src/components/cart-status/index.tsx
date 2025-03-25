
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Cart } from "@/types/cart";

// Import our new components
import { CartFilterSort } from "./CartFilterSort";
import { CartList } from "./CartList";
import { QRScannerDialog } from "./QRScannerDialog";
import { useCartFiltering } from "./useCartFiltering";

// This will be exported and used in the main CartStatus.tsx page
export function CartStatusContent({ initialCarts }: { initialCarts: Cart[] }) {
  const {
    carts,
    setCarts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy, 
    setSortBy,
    sortOrder,
    setSortOrder,
    isFilterOpen,
    setIsFilterOpen,
    filteredAndSortedCarts
  } = useCartFiltering(initialCarts);

  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleQRCodeDetected = (qrCode: string) => {
    const cart = carts.find(c => c.qr_code === qrCode);
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
    const newCart: Cart = {
      ...data,
      storeId: "store1",
      store_id: "store1",
      issues: Array.isArray(data.issues) ? data.issues : [],
    };
    setCarts([...carts, newCart]);
    toast({
      title: "Success",
      description: "Cart details have been updated.",
    });
  };

  const handleDelete = (cartId: string) => {
    setCarts(carts.filter(cart => cart.id !== cartId));
    toast({
      title: "Success",
      description: "Cart has been removed.",
      variant: "destructive",
    });
  };

  const handleStatusChange = (updatedCart: Cart) => {
    setCarts(carts.map(cart => 
      cart.id === updatedCart.id ? updatedCart : cart
    ));
    
    toast({
      title: "Status Updated",
      description: `Cart ${updatedCart.id} status changed to ${updatedCart.status}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your Carts</h1>
          <p className="text-muted-foreground">
            View detailed information about all shopping carts.
          </p>
        </div>
        
        <div className="flex gap-2">
          <CartFilterSort
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
          <Button onClick={() => setIsScanning(true)} className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Scan QR Code
          </Button>
        </div>
      </div>

      {filteredAndSortedCarts.length === 0 ? (
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No carts found matching your filters.</p>
        </div>
      ) : (
        <CartList 
          carts={filteredAndSortedCarts} 
          onStatusChange={handleStatusChange} 
        />
      )}

      <QRScannerDialog
        isOpen={isScanning}
        onOpenChange={setIsScanning}
        onQRCodeDetected={handleQRCodeDetected}
        carts={carts}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
