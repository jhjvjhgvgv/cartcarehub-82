
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus, Mail, CheckCircle } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Invitation } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { ConnectionService } from "@/services/ConnectionService"

interface InvitationFormProps {
  isMaintenance: boolean
  invitations: Invitation[]
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>
}

export function InvitationForm({ isMaintenance, invitations, setInvitations }: InvitationFormProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const pendingInvitations = invitations.filter(inv => inv.status === "pending" || inv.status === "sent")
  const currentUser = ConnectionService.getCurrentUser();

  const sendInvitation = async (type: "store" | "maintenance") => {
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

    setIsSending(true)

    try {
      // Call our edge function to send the invitation email
      const response = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteEmail,
          type: type,
          invitedBy: {
            id: currentUser.id,
            name: currentUser.name,
            type: isMaintenance ? "maintenance" : "store"
          }
        }
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to send invitation");
      }

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
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error sending invitation",
        description: error.message || "There was a problem sending the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
            <div className="flex items-center gap-4">
              <Input
                type="email"
                placeholder={isMaintenance ? "Store email address" : "Maintenance email address"}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button 
                onClick={() => sendInvitation(isMaintenance ? "store" : "maintenance")}
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Invitation Sent Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              An invitation has been sent to <span className="font-medium">{pendingInvitations[pendingInvitations.length - 1]?.email}</span>. 
              They will receive an email with instructions on how to join your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
