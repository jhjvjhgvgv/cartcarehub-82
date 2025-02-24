
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { managedStores } from "@/constants/stores"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Plus, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Store = {
  id: string
  name: string
  status: "active" | "maintenance"
}

type Invitation = {
  email: string
  type: "store" | "maintenance"
  status: "pending" | "accepted"
}

export function StoreMaintenanceManager() {
  const [stores, setStores] = useState<Store[]>(
    managedStores.map(store => ({ ...store, status: "active" }))
  )
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const { toast } = useToast()

  const activeStores = stores.filter(store => store.status === "active")
  const maintenanceStores = stores.filter(store => store.status === "maintenance")
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

  const moveToMaintenance = () => {
    if (!selectedStore) {
      toast({
        title: "No store selected",
        description: "Please select a store to move to maintenance.",
        variant: "destructive",
      })
      return
    }

    setStores(stores.map(store => 
      store.id === selectedStore 
        ? { ...store, status: "maintenance" }
        : store
    ))
    setSelectedStore("")
    
    toast({
      title: "Store moved to maintenance",
      description: "The store has been moved to maintenance status.",
    })
  }

  const moveToActive = () => {
    if (!selectedStore) {
      toast({
        title: "No store selected",
        description: "Please select a store to move to active status.",
        variant: "destructive",
      })
      return
    }

    setStores(stores.map(store => 
      store.id === selectedStore 
        ? { ...store, status: "active" }
        : store
    ))
    setSelectedStore("")
    
    toast({
      title: "Store moved to active",
      description: "The store has been moved back to active status.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Store</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="email"
                      placeholder="Store email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={() => sendInvitation("store")}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Maintenance Provider</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="email"
                      placeholder="Maintenance email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={() => sendInvitation("maintenance")}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {pendingInvitations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
              <div className="space-y-2">
                {pendingInvitations.map((invitation, index) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Maintenance Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Active Stores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={moveToMaintenance}
                  className="w-full mt-4"
                  disabled={!selectedStore || !activeStores.find(s => s.id === selectedStore)}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move to Maintenance
                </Button>
              </CardContent>
            </Card>

            {/* Arrows */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-2">
                <ArrowRight className="w-8 h-8 text-gray-400" />
                <ArrowLeft className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Maintenance Stores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Maintenance Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={moveToActive}
                  className="w-full mt-4"
                  disabled={!selectedStore || !maintenanceStores.find(s => s.id === selectedStore)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Move to Active
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
