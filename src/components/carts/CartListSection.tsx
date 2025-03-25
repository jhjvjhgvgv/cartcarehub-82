
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartFilters } from "@/components/cart-filters";
import { CartList } from "@/components/carts/CartList";
import { Cart } from "@/types/cart";
import { CartFilters as CartFiltersType } from "@/components/cart-filters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCartsToCSV } from "@/utils/csvExport";
import { useToast } from "@/hooks/use-toast";

interface CartListSectionProps {
  filteredCarts: Cart[];
  onEditCart: (cart: Cart) => void;
  onDeleteCart: (cartId: string) => void;
  onEditMultiple: (carts: Cart[]) => void;
  onFilterChange: (filters: CartFiltersType) => void;
  managedStores: Array<{
    id: string;
    name: string;
  }>;
}

export function CartListSection({
  filteredCarts,
  onEditCart,
  onDeleteCart,
  onEditMultiple,
  onFilterChange,
  managedStores
}: CartListSectionProps) {
  const { toast } = useToast();
  
  const handleExportCSV = () => {
    try {
      exportCartsToCSV(filteredCarts, `cart-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Export Successful",
        description: "Your cart data has been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-5 pb-3">
        <CardTitle>All Carts</CardTitle>
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          className="flex items-center gap-2 self-end sm:self-auto px-4 py-2.5"
          disabled={filteredCarts.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CartFilters onFilterChange={onFilterChange} managedStores={managedStores} />
      <CardContent className="rounded-md bg-indigo-100 mt-2 p-5">
        <CartList 
          carts={filteredCarts} 
          onEditCart={onEditCart} 
          onDeleteCart={onDeleteCart} 
          onEditMultiple={onEditMultiple} 
        />
      </CardContent>
    </Card>
  );
}
