
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Store, Pencil, Link, AlertCircle, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StoreForm } from "./StoreForm"
import { useToast } from "@/hooks/use-toast"
import { ConnectionRequestsDialog } from "./ConnectionRequestsDialog"
import { DatabaseConnectionService } from "@/services/connection/database-connection-service"
import { useUserProfile } from "@/hooks/use-user-profile"
import { StoreConnection } from "@/services/connection/types"

interface ConnectedStoresListProps {
  isMaintenance: boolean
  formatDate: (dateString: string) => string
}

export function ConnectedStoresList({ isMaintenance, formatDate }: ConnectedStoresListProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { profile } = useUserProfile()
  const [connections, setConnections] = useState<StoreConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStore, setEditingStore] = useState<{
    id: string;
    name: string;
    status: "active" | "inactive" | "pending";
    connectedSince: string;
  } | null>(null)

  const loadConnections = async () => {
    if (!profile?.id) return
    
    setLoading(true)
    try {
      let connectionData: StoreConnection[] = []
      
      if (isMaintenance) {
        // For maintenance users, get their connection requests
        connectionData = await DatabaseConnectionService.getMaintenanceRequests(profile.id)
      } else {
        // For store users, get their connections with maintenance providers
        // Use both company name and email domain to search for connections
        const possibleStoreIds = [
          profile.company_name || "default-store",
          profile.email?.split('@')[1] || "default-store",
          `store-${profile.id}` // fallback using user ID
        ]
        
        // Try to get connections using any of the possible store IDs
        for (const storeId of possibleStoreIds) {
          const storeConnections = await DatabaseConnectionService.getStoreConnections(storeId)
          connectionData = connectionData.concat(storeConnections)
        }
        
        // Remove duplicates based on connection ID
        connectionData = connectionData.filter((conn, index, self) => 
          index === self.findIndex(c => c.id === conn.id)
        )
      }
      
      setConnections(connectionData)
    } catch (error) {
      console.error("Error loading connections:", error)
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [profile?.id, isMaintenance])

  const handleViewDetails = (storeId: string, storeName: string) => {
    navigate(`/store/${storeId}`, { state: { storeName } })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'pending':
        return 'Pending'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading connections...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Connected {isMaintenance ? "Stores" : "Maintenance Providers"}
          <span className="bg-muted px-2 py-1 rounded text-xs">
            {connections.filter(c => c.status === 'active').length}
          </span>
        </h3>
        {isMaintenance && (
          <ConnectionRequestsDialog isMaintenance={true} onUpdate={loadConnections} />
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isMaintenance ? "Store" : "Provider"}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Connected Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length > 0 ? (
              connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {isMaintenance ? connection.storeId : `Provider ${connection.maintenanceId.slice(0, 8)}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {getStatusIcon(connection.status)}
                      {getStatusLabel(connection.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(connection.connectedAt || connection.requestedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isMaintenance && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(connection.storeId, connection.storeId)}
                        >
                          View Store
                        </Button>
                      )}
                      {!isMaintenance && connection.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Provider Details",
                              description: "Provider management features coming soon!"
                            })
                          }}
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-12 w-12 text-muted-foreground/30" />
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground">
                        No {isMaintenance ? "stores" : "maintenance providers"} connected yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isMaintenance 
                          ? "Start by requesting connections with stores to receive maintenance requests"
                          : "Connect with maintenance providers to get your shopping carts serviced"
                        }
                      </p>
                    </div>
                    {!isMaintenance && (
                      <ConnectionRequestsDialog 
                        isMaintenance={false} 
                        store={{
                          id: profile?.company_name || "your-store",
                          name: profile?.company_name || "Your Store",
                          status: "active",
                          connectedSince: new Date().toISOString()
                        }} 
                        onUpdate={loadConnections}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
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
              onSubmit={(data) => {
                toast({
                  title: "Store updated",
                  description: `Successfully updated ${data.name}`
                })
                setEditingStore(null)
              }}
              onCancel={() => setEditingStore(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
