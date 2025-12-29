import CustomerLayout from "@/components/CustomerLayout";
import { CartStatusContent } from "@/components/cart-status";
import { Cart } from "@/types/cart";

// Mock carts using the new schema
const mockCarts: Cart[] = [
  {
    id: "cart-001",
    qr_token: "QR-123456789", 
    status: "in_service",
    store_org_id: "store-org-1",
    asset_tag: "CART-001",
    model: "Standard",
    notes: null,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
  {
    id: "cart-002",
    qr_token: "QR-987654321", 
    status: "out_of_service",
    store_org_id: "store-org-1",
    asset_tag: "CART-002",
    model: "Heavy Duty",
    notes: "Wheel alignment needed",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-14T00:00:00Z",
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
