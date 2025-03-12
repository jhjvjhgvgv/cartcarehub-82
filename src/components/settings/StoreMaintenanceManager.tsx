
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus, Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type Invitation = {
  email: string
  type: "store" | "maintenance"
  status: "pending" | "accepted" | "sent"
  sentAt: string
}

interface StoreMaintenanceManagerProps {
  isMaintenance: boolean
}

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const pendingInvitations = invitations.filter(inv => inv.status === "pending" || inv.status === "sent")

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
      // Simulate API call to send invitation
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, this would make an API call to send the invitation
      setInvitations([...invitations, {
        email: inviteEmail,
        type,
        status: "sent",
        sentAt: new Date().toISOString()
      }])

      setInviteEmail("")
      setIsDialogOpen(false)
      setIsConfirmationOpen(true)
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "There was a problem sending the invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
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
        <div className="grid gap-4">
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

          {pendingInvitations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
              <div className="space-y-2">
                {pendingInvitations
                  .filter(inv => inv.type === (isMaintenance ? "store" : "maintenance"))
                  .map((invitation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent {formatDate(invitation.sentAt)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => resendInvitation(invitation.email)}>
                        Resend
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
