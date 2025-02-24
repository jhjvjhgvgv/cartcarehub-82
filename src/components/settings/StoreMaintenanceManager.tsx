
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Invitation = {
  email: string
  type: "store" | "maintenance"
  status: "pending" | "accepted"
}

interface StoreMaintenanceManagerProps {
  isMaintenance: boolean
}

export function StoreMaintenanceManager({ isMaintenance }: StoreMaintenanceManagerProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const { toast } = useToast()

  const pendingInvitations = invitations.filter(inv => inv.status === "pending")

  const sendInvitation = (type: "store" | "maintenance") => {
    if (!inviteEmail) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would make an API call to send the invitation
    setInvitations([...invitations, {
      email: inviteEmail,
      type,
      status: "pending"
    }])

    setInviteEmail("")
    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteEmail}`,
    })
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
          <Dialog>
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
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="email"
                    placeholder={isMaintenance ? "Store email address" : "Maintenance email address"}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={() => sendInvitation(isMaintenance ? "store" : "maintenance")}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                        <p className="text-xs text-muted-foreground capitalize">{invitation.type}</p>
                      </div>
                      <Button variant="ghost" size="sm">Resend</Button>
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
