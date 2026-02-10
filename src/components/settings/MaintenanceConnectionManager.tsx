import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ConnectionDialog } from "./ConnectionDialog";
import { AccountIdentifier } from "./AccountIdentifier";
import { ConnectionStatus } from "./ConnectionStatus";
import { PendingInvitationsList } from "./PendingInvitationsList";
import { ConnectedStoresList } from "./ConnectedStoresList";
import { Invitation } from "./types";

export function MaintenanceConnectionManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { profile } = useUserProfile();
  const currentUser = { 
    id: profile?.id || '', 
    name: profile?.display_name || profile?.company_name || '', 
    type: 'maintenance' as const 
  };
  const isMaintenance = true;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Store Connections
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Connect to Store
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
          
          {/* Connected Stores List */}
          <ConnectedStoresList 
            isMaintenance={isMaintenance} 
            formatDate={formatDate} 
          />

          {/* Pending Invitations */}
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
        userOrgId={profile?.org_id}
        userOrgName={profile?.org_name}
      />
    </Card>
  );
}