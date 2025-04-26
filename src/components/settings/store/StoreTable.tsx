
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Store, Pencil, Trash2, Plus, CheckCircle, Clock } from "lucide-react";
import { type ManagedStore } from "../types/store";

interface StoreTableProps {
  stores: ManagedStore[];
  onEdit: (store: ManagedStore) => void;
  onDelete: (storeId: string) => void;
  onAdd: () => void;
}

export function StoreTable({ stores, onEdit, onDelete, onAdd }: StoreTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
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
                    onClick={onAdd}
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
                      onClick={() => onEdit(store)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => onDelete(store.id)}
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
  );
}
