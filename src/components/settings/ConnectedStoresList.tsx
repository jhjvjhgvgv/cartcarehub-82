
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Store, Pencil } from "lucide-react"
import { managedStores } from "@/constants/stores"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StoreForm } from "./StoreForm"
import { useToast } from "@/components/ui/use-toast"

interface ConnectedStoresListProps {
  isMaintenance: boolean
  formatDate: (dateString: string) => string
}

export function ConnectedStoresList({ isMaintenance, formatDate }: ConnectedStoresListProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [editingStore, setEditingStore] = useState<{
    id: string;
    name: string;
    status: "active" | "inactive" | "pending";
    connectedSince: string;
  } | null>(null)

  const handleViewDetails = (storeId: string, storeName: string) => {
    navigate(`/store/${storeId}`, { state: { storeName } })
  }

  const handleEditStore = (store: typeof managedStores[0]) => {
    setEditingStore({
      id: store.id,
      name: store.name,
      status: "active", // Default to active since our mock data doesn't have this field
      connectedSince: store.connectedSince
    })
  }

  const handleSaveStore = (data: any) => {
    // In a real app, you would update the store in the database
    // For this demo, we'll just show a toast notification
    toast({
      title: "Store updated",
      description: `Successfully updated ${data.name}`
    })
    setEditingStore(null)
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Connected {isMaintenance ? "Stores" : "Maintenance Providers"}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Connected Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isMaintenance ? 
              managedStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {store.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(store.connectedSince)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditStore(store)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(store.id, store.name)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : 
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No maintenance providers connected yet.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      <Dialog open={editingStore !== null} onOpenChange={(open) => !open && setEditingStore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {editingStore && (
            <StoreForm
              initialData={editingStore}
              onSubmit={handleSaveStore}
              onCancel={() => setEditingStore(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
