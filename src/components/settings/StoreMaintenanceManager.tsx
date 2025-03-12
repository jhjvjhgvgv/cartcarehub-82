
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { InvitationForm } from "./InvitationForm"
import { ConnectedStoresList } from "./ConnectedStoresList"
import { PendingInvitationsList } from "./PendingInvitationsList"
import { ConnectionStatus } from "./ConnectionStatus"
import { Invitation, StoreMaintenanceManagerProps } from "./types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ConnectionService } from "@/services/ConnectionService"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [connectionId, setConnectionId] = useState("")
  const [availableOptions, setAvailableOptions] = useState<{id: string, name: string}[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load available connection options when dialog opens
    if (isDialogOpen) {
      if (isMaintenance) {
        setAvailableOptions(ConnectionService.getStores());
      } else {
        setAvailableOptions(ConnectionService.getMaintenanceProviders());
      }
    }
  }, [isDialogOpen, isMaintenance]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCreateConnection = async () => {
    if (!connectionId.trim()) {
      toast({
        title: "Error",
        description: "Please select a valid ID",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      let success = false;
      
      if (isMaintenance) {
        // Maintenance provider connecting to a store
        success = await ConnectionService.requestConnection(
          connectionId, // Store ID
          "maint_123" // Current maintenance provider ID (hardcoded for demo)
        )
      } else {
        // Store connecting to a maintenance provider
        success = await ConnectionService.requestConnection(
          "store_123", // Current store ID (hardcoded for demo)
          connectionId // Maintenance provider ID
        )
      }
      
      if (success) {
        toast({
          title: "Connection Requested",
          description: `Your connection request has been sent to ${isMaintenance ? "the store" : "the maintenance provider"}.`,
        })
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to create connection request or connection already exists",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating connection:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isMaintenance ? "Store Management" : "Maintenance Management"}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isMaintenance ? "Connect to Store" : "Connect to Maintenance"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Current Account ID */}
          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-sm font-medium mb-1">Your {isMaintenance ? "Maintenance Provider" : "Store"} ID:</p>
            <code className="text-sm bg-background px-2 py-1 rounded border">
              {isMaintenance ? "maint_123" : "store_123"}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Share this ID with {isMaintenance ? "stores" : "maintenance providers"} who want to connect with you.
            </p>
          </div>
          
          {/* Connection Status Card */}
          <ConnectionStatus isMaintenance={isMaintenance} />
          
          <InvitationForm 
            isMaintenance={isMaintenance} 
            invitations={invitations} 
            setInvitations={setInvitations} 
          />

          <ConnectedStoresList 
            isMaintenance={isMaintenance} 
            formatDate={formatDate} 
          />

          <PendingInvitationsList 
            invitations={invitations} 
            setInvitations={setInvitations} 
            isMaintenance={isMaintenance} 
            formatDate={formatDate} 
          />
        </div>
      </CardContent>

      {/* Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {isMaintenance ? "Store" : "Maintenance Provider"}</DialogTitle>
            <DialogDescription>
              Select the {isMaintenance ? "store" : "maintenance provider"} you want to connect with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="connection-id">
                {isMaintenance ? "Store" : "Maintenance Provider"}
              </Label>
              <Select onValueChange={setConnectionId} value={connectionId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${isMaintenance ? "store" : "maintenance provider"}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} ({option.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCreateConnection} 
              disabled={isConnecting || !connectionId.trim()} 
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
