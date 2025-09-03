
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, CheckCircle, XCircle, Clock, Users, Building, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DatabaseConnectionService } from "@/services/connection/database-connection-service"
import { useUserProfile } from "@/hooks/use-user-profile"
import { StoreConnection } from "@/services/connection/types"
import { generateStoreId } from "@/utils/store-id-utils"

interface ConnectionRequestsDialogProps {
  isMaintenance: boolean
  store?: {
    id: string
    name: string
    status: string
    connectedSince: string
  }
  onUpdate?: () => void
}

export function ConnectionRequestsDialog({ isMaintenance, store, onUpdate }: ConnectionRequestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<StoreConnection[]>([])
  const [availableProviders, setAvailableProviders] = useState<Array<{id: string, name: string}>>([])
  const { toast } = useToast()
  const { profile } = useUserProfile()

  const loadPendingRequests = async () => {
    if (!profile?.id) return
    
    try {
      let requests: StoreConnection[] = []
      if (isMaintenance) {
        requests = await DatabaseConnectionService.getMaintenanceRequests(profile.id)
      } else {
        // For store users, check multiple possible store IDs
        const possibleStoreIds = [
          profile.company_name || "default-store",
          profile.email?.split('@')[1] || "default-store",
          `store-${profile.id}`
        ]
        
        for (const storeId of possibleStoreIds) {
          const storeConnections = await DatabaseConnectionService.getStoreConnections(storeId)
          requests = requests.concat(storeConnections)
        }
        
        // Remove duplicates
        requests = requests.filter((req, index, self) => 
          index === self.findIndex(r => r.id === req.id)
        )
      }
      setPendingRequests(requests.filter(r => r.status === 'pending'))
    } catch (error) {
      console.error("Error loading pending requests:", error)
    }
  }

  const loadAvailableProviders = async () => {
    if (!isMaintenance) return
    
    try {
      const providers = await DatabaseConnectionService.getMaintenanceProviders()
      setAvailableProviders(providers)
    } catch (error) {
      console.error("Error loading providers:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPendingRequests()
      loadAvailableProviders()
    }
  }, [isOpen, profile?.id])

  const handleSendRequest = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    if (!profile?.id) {
      toast({
        title: "Authentication required", 
        description: "Please sign in to send connection requests",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (isMaintenance) {
        // Maintenance provider requesting connection to store
        // For now, use a simple store ID based on email domain
        const storeId = email.split('@')[1] || "store-" + Date.now()
        const success = await DatabaseConnectionService.requestConnection(storeId, profile.id)
        
        if (success) {
          toast({
            title: "Connection request sent",
            description: `Request sent to store at ${email}`
          })
          setEmail("")
          loadPendingRequests()
          onUpdate?.()
        } else {
          toast({
            title: "Request failed",
            description: "Failed to send connection request",
            variant: "destructive"
          })
        }
      } else {
        // Store requesting connection to maintenance provider - use standardized store ID
        const storeId = generateStoreId(profile)
        console.log('ConnectionRequestsDialog: Using store ID:', storeId, 'for profile:', profile)
        const result = await DatabaseConnectionService.requestConnectionByEmail(storeId, email)
        
        if (result.success) {
          toast({
            title: "Connection request sent",
            description: result.message
          })
          setEmail("")
          loadPendingRequests()
          onUpdate?.()
        } else {
          toast({
            title: "Request failed",
            description: result.message,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error sending request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const success = await DatabaseConnectionService.acceptConnection(connectionId)
      if (success) {
        toast({
          title: "Connection accepted",
          description: "The connection has been established"
        })
        loadPendingRequests()
        onUpdate?.()
      } else {
        toast({
          title: "Failed to accept",
          description: "Could not accept the connection request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const success = await DatabaseConnectionService.rejectConnection(connectionId)
      if (success) {
        toast({
          title: "Connection rejected",
          description: "The connection request has been rejected"
        })
        loadPendingRequests()
        onUpdate?.()
      } else {
        toast({
          title: "Failed to reject",
          description: "Could not reject the connection request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          {isMaintenance ? "Connect to Stores" : "Find Maintenance"}
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isMaintenance ? "Connect to Stores" : "Connect to Maintenance Providers"}
          </DialogTitle>
          <DialogDescription>
            {isMaintenance 
              ? "Send connection requests to stores that need maintenance services"
              : "Find and connect with maintenance providers for your shopping carts"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Send New Request */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Send Connection Request
              </CardTitle>
              <CardDescription>
                Enter the email address of the {isMaintenance ? "store" : "maintenance provider"} you'd like to connect with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isMaintenance ? "store@example.com" : "maintenance@provider.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendRequest()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSendRequest}
                    disabled={loading || !email.trim()}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {loading ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Providers (for maintenance users) */}
          {isMaintenance && availableProviders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Available Stores
                </CardTitle>
                <CardDescription>
                  Verified stores that are available for connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">Store ID: {provider.id.slice(0, 8)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmail(`${provider.name.toLowerCase().replace(/\s+/g, '')}@store.com`)
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Requests
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {isMaintenance 
                    ? "Connection requests you've received from stores"
                    : "Your pending connection requests to maintenance providers"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isMaintenance ? "Store" : "Provider"}</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {isMaintenance ? request.storeId : `Provider ${request.maintenanceId.slice(0, 8)}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isMaintenance ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(request.id)}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                className="flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline">Waiting for response</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
