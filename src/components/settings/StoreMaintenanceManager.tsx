
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { InvitationForm } from "./InvitationForm"
import { ConnectedStoresList } from "./ConnectedStoresList"
import { PendingInvitationsList } from "./PendingInvitationsList"
import { ConnectionStatus } from "./ConnectionStatus"
import { Invitation, StoreMaintenanceManagerProps } from "./types"

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isMaintenance ? "Store Management" : "Maintenance Management"}
        </CardTitle>
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
