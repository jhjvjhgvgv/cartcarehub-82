
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Invitation, InvitationFormProps } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { ConnectionService } from "@/services/ConnectionService"
import { InvitationError } from "./InvitationError"
import { InvitationConfirmation } from "./InvitationConfirmation"
import { DevModeInstructions } from "./DevModeInstructions"
import { sendInvitation } from "./invitationService"

export function InvitationForm({ isMaintenance, invitations, setInvitations }: InvitationFormProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const { toast } = useToast()

  const pendingInvitations = invitations.filter(inv => inv.status === "pending" || inv.status === "sent")
  // Using demo user for invitation form
  const currentUser = { id: 'demo-user', name: 'Demo User', type: 'store' as const };

  const handleSendInvitation = async () => {
    if (!inviteEmail) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Clear any previous errors
    setErrorMessage(null)
    setErrorDetails(null)
    setIsSending(true)

    try {
      const type = isMaintenance ? "store" : "maintenance";
      
      const result = await sendInvitation(
        inviteEmail, 
        type, 
        currentUser,
        setErrorMessage,
        setErrorDetails
      );
      
      if (result.success) {
        // Save the invitation in our local state
        setInvitations([...invitations, {
          email: inviteEmail,
          type,
          status: "sent",
          sentAt: new Date().toISOString()
        }]);

        setInviteEmail("");
        setIsDialogOpen(false);
        setIsConfirmationOpen(true);
        
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${inviteEmail}.`,
        });
      }
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      
      // Only show toast for general errors, not development mode errors handled separately
      if (!errorMessage) {
        toast({
          title: "Error sending invitation",
          description: error.message || "There was a problem sending the invitation. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  }

  const closeErrorAndDialog = () => {
    setErrorMessage(null);
    setErrorDetails(null);
    setIsDialogOpen(false);
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {isMaintenance ? "Invite Store" : "Invite Maintenance Provider"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isMaintenance ? "Invite Store" : "Invite Maintenance Provider"}
            </DialogTitle>
            <DialogDescription>
              Enter the email address to send an invitation. They will receive an email with instructions to join.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <InvitationError errorMessage={errorMessage} errorDetails={errorDetails} />
            
            <div className="flex items-center gap-4">
              <Input
                type="email"
                placeholder={isMaintenance ? "Store email address" : "Maintenance email address"}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button 
                onClick={handleSendInvitation}
                disabled={isSending}
              >
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <DevModeInstructions show={!!errorDetails} />
        </DialogContent>
      </Dialog>

      <InvitationConfirmation 
        isOpen={isConfirmationOpen} 
        setIsOpen={setIsConfirmationOpen}
        email={pendingInvitations.length > 0 ? pendingInvitations[pendingInvitations.length - 1]?.email : undefined}
      />
    </>
  )
}
