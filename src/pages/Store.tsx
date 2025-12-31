import { useParams, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CartForm } from "@/components/cart-form";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreCartsTable, type LocalCart } from "@/components/store/StoreCartsTable";
import { useState } from "react";
import { CartStatus } from "@/types/cart";

const Store = () => {
  const { id } = useParams();
  const location = useLocation();
  const [editingCart, setEditingCart] = useState<LocalCart | null>(null);

  // This would typically come from an API
  const storeData = {
    id: Number(id),
    name: location.state?.storeName || `Store ${id}`,
    location: "123 Main St",
    totalCarts: 50,
    activeCarts: 45,
    maintenanceNeeded: 5,
    carts: [
      { id: 1, cartNumber: "CART-001", status: "in_service" as CartStatus, notes: "" },
      {
        id: 2,
        cartNumber: "CART-002",
        status: "out_of_service" as CartStatus,
        notes: "Wheel alignment needed",
      },
      { id: 3, cartNumber: "CART-003", status: "in_service" as CartStatus, notes: "" },
    ] as LocalCart[],
  };

  const handleSaveCart = (data: any) => {
    console.log("Saving cart:", data);
    setEditingCart(null);
  };

  const handleEditCart = (cart: LocalCart) => {
    setEditingCart(cart);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="p-4 space-y-4">
          <StoreHeader
            name={storeData.name}
            location={storeData.location}
            totalCarts={storeData.totalCarts}
            activeCarts={storeData.activeCarts}
            maintenanceNeeded={storeData.maintenanceNeeded}
          />

          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Carts Overview</h2>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <StoreCartsTable carts={storeData.carts} onEditCart={handleEditCart} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Dialog open={editingCart !== null} onOpenChange={() => setEditingCart(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Cart {editingCart?.cartNumber}</DialogTitle>
              <DialogDescription>
                Make changes to the cart details below.
              </DialogDescription>
            </DialogHeader>
            {editingCart && (
              <CartForm
                initialData={{
                  qr_token: editingCart.cartNumber,
                  store_org_id: storeData.id.toString(),
                  status: editingCart.status,
                  asset_tag: "",
                  model: "",
                  notes: editingCart.notes,
                }}
                onSubmit={handleSaveCart}
                onCancel={() => setEditingCart(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Store;
