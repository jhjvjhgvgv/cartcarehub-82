
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Building, Search, Users, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DatabaseConnectionService } from "@/services/connection/database-connection-service"
import { useUserProfile } from "@/hooks/use-user-profile"

interface ConnectionDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  isMaintenance: boolean
  currentUserId: string
}

export function ConnectionDialog({ 
  isDialogOpen, 
  setIsDialogOpen, 
  isMaintenance, 
  currentUserId 
}: ConnectionDialogProps) {
  const [email, setEmail] = useState("")
  const [storeId, setStoreId] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { profile } = useUserProfile()

  const handleSendRequest = async () => {
    if (!email.trim() && !storeId.trim()) {
      toast({
        title: "Information required",
        description: isMaintenance 
          ? "Please enter a store email or store ID" 
          : "Please enter a maintenance provider email",
        variant: "destructive"
      })
      return
    }

    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send connection requests",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      let success = false
      let message = ""

      if (isMaintenance) {
        // Maintenance provider connecting to store
        const targetStoreId = storeId.trim() || email.split('@')[1] || `store-${Date.now()}`
        
        // Get maintenance provider ID from profile using user ID
        const provider = await DatabaseConnectionService.getMaintenanceProviderByUserId(currentUserId)
        if (!provider) {
          toast({
            title: "Provider not found",
            description: "Your maintenance provider profile could not be found. Please complete your profile setup.",
            variant: "destructive"
          })
          return
        }

        success = await DatabaseConnectionService.requestConnection(targetStoreId, provider.id)
        message = success 
          ? `Connection request sent to store: ${targetStoreId}`
          : "Failed to send connection request. A connection may already exist."
      } else {
        // Store connecting to maintenance provider
        const userStoreId = profile?.company_name || "default-store"
        const result = await DatabaseConnectionService.requestConnectionByEmail(userStoreId, email)
        success = result.success
        message = result.message
      }

      if (success) {
        toast({
          title: "Request sent",
          description: message
        })
        setEmail("")
        setStoreId("")
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Request failed", 
          description: message,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setStoreId("")
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
            {isMaintenance ? "Connect to Store" : "Connect to Maintenance Provider"}
          </DialogTitle>
          <DialogDescription>
            {isMaintenance 
              ? "Send a connection request to a store that needs maintenance services"
              : "Find and connect with a maintenance provider for your shopping carts"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" />
                Connection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMaintenance ? (
                <>
                  <div>
                    <Label htmlFor="storeId">Store ID (Optional)</Label>
                    <Input
                      id="storeId"
                      placeholder="store-12345"
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Or enter store email to auto-generate ID</span>
                  </div>
                </>
              ) : null}
              
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
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendRequest()}
                />
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
              onClick={handleSendRequest}
              disabled={loading || (!email.trim() && !storeId.trim())}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
