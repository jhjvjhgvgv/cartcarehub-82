
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Store, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { ManagedStore } from "./types";

// Example data - replace with actual API calls in a real implementation
const initialStores: ManagedStore[] = [
  { id: "store1", name: "Downtown Branch", status: "active", createdAt: "2023-01-15" },
  { id: "store2", name: "Mall Location", status: "active", createdAt: "2023-03-22" },
  { id: "store3", name: "Airport Kiosk", status: "inactive", createdAt: "2023-05-10" },
];

interface StoreFormData {
  name: string;
  address: string;
  status: "active" | "inactive" | "pending";
}

export function StoreManager() {
  const [stores, setStores] = useState<ManagedStore[]>(initialStores);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<ManagedStore | null>(null);
  const { toast } = useToast();
  
  const form = useForm<StoreFormData>({
    defaultValues: {
      name: "",
      address: "",
      status: "active",
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddStore = () => {
    setEditingStore(null);
    form.reset({
      name: "",
      address: "",
      status: "active"
    });
    setIsDialogOpen(true);
  };

  const handleEditStore = (store: ManagedStore) => {
    setEditingStore(store);
    form.reset({
      name: store.name,
      address: store.address || "",
      status: store.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteStore = (storeId: string) => {
    // In a real app, you would call an API to delete the store
    setStores(stores.filter(store => store.id !== storeId));
    toast({
      title: "Store removed",
      description: "The store has been removed from your account."
    });
  };

  const onSubmit = (data: StoreFormData) => {
    if (editingStore) {
      // Update existing store
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
      // Add new store
      const newStore: ManagedStore = {
        id: `store${Date.now()}`, // In a real app, this would come from the server
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    <div className="flex flex-col items-center gap-3">
                      <Store className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stores added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddStore}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Store
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {store.name}
                      </div>
                      {store.address && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {store.address}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {store.status === "active" ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Active</span>
                          </>
                        ) : store.status === "inactive" ? (
                          <span className="text-muted-foreground">Inactive</span>
                        ) : (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                            <span>Pending</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(store.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditStore(store)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteStore(store.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Store Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "Edit Store" : "Add New Store"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Store address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStore ? "Save Changes" : "Add Store"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
