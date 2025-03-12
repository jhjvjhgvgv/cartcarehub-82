
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Invitation } from "./types"

interface PendingInvitationsListProps {
  invitations: Invitation[]
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>
  isMaintenance: boolean
  formatDate: (dateString: string) => string
}

export function PendingInvitationsList({ 
  invitations, 
  setInvitations, 
  isMaintenance, 
  formatDate 
}: PendingInvitationsListProps) {
  const { toast } = useToast()
  const pendingInvitations = invitations.filter(inv => inv.status === "pending" || inv.status === "sent")
  
  if (pendingInvitations.length === 0) {
    return null;
  }

  const resendInvitation = async (email: string) => {
    // Simulate resending the invitation
    setInvitations(invitations.map(inv => 
      inv.email === email 
        ? { ...inv, sentAt: new Date().toISOString() } 
        : inv
    ))

    toast({
      title: "Invitation resent",
      description: `Invitation has been resent to ${email}`,
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingInvitations
              .filter(inv => inv.type === (isMaintenance ? "store" : "maintenance"))
              .map((invitation, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(invitation.sentAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => resendInvitation(invitation.email)}
                      className="inline-flex items-center"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Resend
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
