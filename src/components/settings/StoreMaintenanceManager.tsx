
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { InvitationForm } from "./InvitationForm"
import { ConnectedStoresList } from "./ConnectedStoresList"
import { PendingInvitationsList } from "./PendingInvitationsList"
import { ConnectionStatus } from "./ConnectionStatus"
import { Invitation, StoreMaintenanceManagerProps } from "./types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ConnectionService } from "@/services/ConnectionService"
import { ConnectionDialog } from "./ConnectionDialog"
import { AccountIdentifier } from "./AccountIdentifier"

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const currentUser = ConnectionService.getCurrentUser();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
          <AccountIdentifier 
            currentUser={currentUser}
            isMaintenance={isMaintenance}
          />
          
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
      <ConnectionDialog 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isMaintenance={isMaintenance}
        currentUserId={currentUser.id}
      />
    </Card>
  )
}
