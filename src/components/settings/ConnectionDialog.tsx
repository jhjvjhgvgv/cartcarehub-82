
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ConnectionService } from "@/services/ConnectionService"

interface ConnectionDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  isMaintenance: boolean
  currentUserId: string
}

export function ConnectionDialog({ isDialogOpen, setIsDialogOpen, isMaintenance, currentUserId }: ConnectionDialogProps) {
  const [connectionId, setConnectionId] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [availableOptions, setAvailableOptions] = useState<{id: string, name: string}[]>([])
  const { toast } = useToast()

  // Load available connection options when dialog opens
  // useEffect moved to the main component and passed to this component as a prop
  if (isDialogOpen && availableOptions.length === 0) {
    if (isMaintenance) {
      setAvailableOptions(ConnectionService.getStores());
    } else {
      setAvailableOptions(ConnectionService.getMaintenanceProviders());
    }
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
          currentUserId // Current maintenance provider ID
        )
      } else {
        // Store connecting to a maintenance provider
        success = await ConnectionService.requestConnection(
          currentUserId, // Current store ID
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
  )
}
