
import CustomerLayout from "@/components/CustomerLayout";
import { CartStatusContent } from "@/components/cart-status";
import { Cart } from "@/types/cart";

const mockCarts: Cart[] = [
  {
    id: "CART-001",
    qr_code: "QR-123456789", 
    status: "active",
    store: "SuperMart Downtown",
    storeId: "store1",
    store_id: "store1",
    lastMaintenance: "2024-03-15",
    issues: [],
  },
  {
    id: "CART-002",
    qr_code: "QR-987654321", 
    status: "maintenance",
    store: "SuperMart Downtown",
    storeId: "store1",
    store_id: "store1",
    lastMaintenance: "2024-03-14",
    issues: ["Wheel alignment needed"],
  },
];

const CartStatus = () => {
  return (
    <CustomerLayout>
      <CartStatusContent initialCarts={mockCarts} />
    </CustomerLayout>
  );
};

export default CartStatus;
