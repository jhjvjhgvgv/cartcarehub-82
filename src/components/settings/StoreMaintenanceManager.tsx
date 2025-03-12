
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { InvitationForm } from "./InvitationForm"
import { ConnectedStoresList } from "./ConnectedStoresList"
import { PendingInvitationsList } from "./PendingInvitationsList"
import { ConnectionStatus } from "./ConnectionStatus"
import { Invitation, StoreMaintenanceManagerProps } from "./types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ConnectionService } from "@/services/ConnectionService"
import { Beaker } from "lucide-react"

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isCreatingTestConnection, setIsCreatingTestConnection] = useState(false)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCreateTestConnection = async () => {
    setIsCreatingTestConnection(true)
    try {
      const success = await ConnectionService.createTestConnection()
      if (success) {
        toast({
          title: "Test Connection Created",
          description: "A test connection between a store and maintenance provider has been created.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create test connection",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating test connection:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTestConnection(false)
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
          onClick={handleCreateTestConnection}
          disabled={isCreatingTestConnection}
          className="flex items-center gap-2"
        >
          <Beaker className="h-4 w-4" />
          Create Test Connection
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
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
    </Card>
  )
}
