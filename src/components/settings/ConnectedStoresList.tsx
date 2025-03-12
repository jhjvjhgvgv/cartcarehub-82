
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Store, Pencil, Link } from "lucide-react"
import { managedStores } from "@/constants/stores"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StoreForm } from "./StoreForm"
import { useToast } from "@/hooks/use-toast"
import { ConnectionRequestsDialog } from "./ConnectionRequestsDialog"

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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Connected {isMaintenance ? "Stores" : "Maintenance Providers"}</h3>
        {isMaintenance && (
          <ConnectionRequestsDialog isMaintenance={true} />
        )}
      </div>
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
                <TableCell colSpan={4} className="text-center py-4">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">No maintenance providers connected yet.</p>
                    <ConnectionRequestsDialog isMaintenance={false} store={{
                      id: "store123", // This would be the current store's ID
                      name: "Your Store",
                      status: "active",
                      connectedSince: new Date().toISOString()
                    }} />
                  </div>
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
