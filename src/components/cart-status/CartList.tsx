
import { Cart } from "@/types/cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartCard } from "./CartCard";

interface CartListProps {
  carts: Cart[];
  onStatusChange: (cart: Cart) => void;
}

export function CartList({ carts, onStatusChange }: CartListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {carts.map((cart) => (
          <CartCard 
            key={cart.id} 
            cart={cart} 
            onStatusChange={onStatusChange} 
          />
        ))}
      </div>
    </ScrollArea>
  );
}
