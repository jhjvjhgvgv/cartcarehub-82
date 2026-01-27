import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Search, Users, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface ConnectionDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  isMaintenance: boolean
  currentUserId: string
  userOrgId?: string
}

export function ConnectionDialog({ 
  isDialogOpen, 
  setIsDialogOpen, 
  isMaintenance, 
  currentUserId,
  userOrgId
}: ConnectionDialogProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    if (!userOrgId) {
      toast({
        title: "Organization not found",
        description: "Please complete your profile setup first",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Use the invite_user_to_org RPC
      const role = isMaintenance ? 'store_admin' : 'provider_tech'
      
      const { data, error } = await supabase.rpc('invite_user_to_org', {
        p_org_id: userOrgId,
        p_email: email.trim().toLowerCase(),
        p_role: role as any,
        p_provider_org_id: isMaintenance ? userOrgId : null
      })

      if (error) throw error

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })
      
      setEmail("")
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error sending invitation:", error)
      toast({
        title: "Failed to send invitation",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isMaintenance ? "Invite Store" : "Invite Maintenance Provider"}
          </DialogTitle>
          <DialogDescription>
            {isMaintenance 
              ? "Send an invitation to a store that needs maintenance services"
              : "Invite a maintenance provider to manage your shopping carts"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" />
                Invitation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">
                  {isMaintenance ? "Store Email" : "Maintenance Provider Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isMaintenance ? "store@retailchain.com" : "maintenance@provider.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendInvitation()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  They will receive an email invitation to connect with your organization
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvitation}
              disabled={loading || !email.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Mail className="h-4 w-4" /> Send Invitation</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
