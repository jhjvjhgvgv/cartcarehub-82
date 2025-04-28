import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StoreTable } from "./store/StoreTable";
import { StoreFormDialog } from "./store/StoreFormDialog";
import { type ManagedStore, type StoreFormData } from "./types/store";

export function StoreManager() {
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<ManagedStore | null>(null);
  const { toast } = useToast();

  const handleAddStore = () => {
    setEditingStore(null);
    setIsDialogOpen(true);
  };

  const handleEditStore = (store: ManagedStore) => {
    setEditingStore(store);
    setIsDialogOpen(true);
  };

  const handleDeleteStore = (storeId: string) => {
    setStores(stores.filter(store => store.id !== storeId));
    toast({
      title: "Store removed",
      description: "The store has been removed from your account."
    });
  };

  const handleSubmit = (data: StoreFormData) => {
    if (editingStore) {
      setStores(stores.map(store => 
        store.id === editingStore.id 
          ? { ...store, ...data, updatedAt: new Date().toISOString() } 
          : store
      ));
      
      toast({
        title: "Store updated",
        description: `${data.name} has been updated successfully.`
      });
    } else {
      const newStore: ManagedStore = {
        id: `store${Date.now()}`,
        name: data.name,
        address: data.address,
        status: data.status,
        createdAt: new Date().toISOString()
      };
      
      setStores([...stores, newStore]);
      
      toast({
        title: "Store added",
        description: `${data.name} has been added to your account.`
      });
    }
    
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Stores</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAddStore}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Store
        </Button>
      </CardHeader>
      <CardContent>
        <StoreTable
          stores={stores}
          onEdit={handleEditStore}
          onDelete={handleDeleteStore}
          onAdd={handleAddStore}
        />
      </CardContent>

      <StoreFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        editingStore={editingStore}
      />
    </Card>
  );
}
