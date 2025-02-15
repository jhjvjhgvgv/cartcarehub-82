
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartFilters } from "@/components/cart-filters";
import { CartList } from "@/components/carts/CartList";
import { Cart } from "@/types/cart";
import { CartFilters as CartFiltersType } from "@/components/cart-filters";

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
  console.log('CartListSection rendered with carts:', filteredCarts); // Debug log

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Carts</CardTitle>
        <CartFilters onFilterChange={onFilterChange} managedStores={managedStores} />
      </CardHeader>
      <CardContent className="rounded-md bg-indigo-100">
        <CartList 
          key={filteredCarts.length} // Force re-render when cart count changes
          carts={filteredCarts} 
          onEditCart={onEditCart} 
          onDeleteCart={onDeleteCart} 
          onEditMultiple={onEditMultiple} 
        />
      </CardContent>
    </Card>
  );
}
