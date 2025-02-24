
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { managedStores } from "@/constants/stores"
import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Store = {
  id: string
  name: string
  status: "active" | "maintenance"
}

export function StoreMaintenanceManager() {
  const [stores, setStores] = useState<Store[]>(
    managedStores.map(store => ({ ...store, status: "active" }))
  )
  const [selectedStore, setSelectedStore] = useState<string>("")
  const { toast } = useToast()

  const activeStores = stores.filter(store => store.status === "active")
  const maintenanceStores = stores.filter(store => store.status === "maintenance")

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
  )
}
