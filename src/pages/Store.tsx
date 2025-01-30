import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartForm } from "@/components/cart-form";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreCartsTable } from "@/components/store/StoreCartsTable";
import { useState } from "react";

interface Cart {
  id: number;
  cartNumber: string;
  status: "active" | "maintenance" | "retired";
  lastMaintenance: string;
  issues: string[];
}

const Store = () => {
  const { id } = useParams();
  const [editingCart, setEditingCart] = useState<Cart | null>(null);

  // This would typically come from an API
  const storeData = {
    id: Number(id),
    name: "SuperMart Downtown",
    location: "123 Main St",
    totalCarts: 50,
    activeCarts: 45,
    maintenanceNeeded: 5,
    carts: [
      { id: 1, cartNumber: "CART-001", status: "active", lastMaintenance: "2024-01-15", issues: [] },
      {
        id: 2,
        cartNumber: "CART-002",
        status: "maintenance",
        lastMaintenance: "2024-01-10",
        issues: ["Wheel alignment needed"],
      },
      { id: 3, cartNumber: "CART-003", status: "active", lastMaintenance: "2024-01-20", issues: [] },
    ] as Cart[],
  };

  const handleSaveCart = (data: any) => {
    console.log("Saving cart:", data);
    setEditingCart(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                <StoreCartsTable carts={storeData.carts} onEditCart={setEditingCart} />
              </div>
            </div>
          </div>
        </Card>

        <Dialog open={editingCart !== null} onOpenChange={() => setEditingCart(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Cart {editingCart?.cartNumber}</DialogTitle>
            </DialogHeader>
            {editingCart && (
              <CartForm
                initialData={{
                  rfidTag: editingCart.cartNumber,
                  store: storeData.name,
                  status: editingCart.status,
                  lastMaintenance: editingCart.lastMaintenance,
                  issues: editingCart.issues.join("\n"),
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