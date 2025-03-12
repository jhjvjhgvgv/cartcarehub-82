
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Store } from "lucide-react"
import { managedStores } from "@/constants/stores"

interface ConnectedStoresListProps {
  isMaintenance: boolean
  formatDate: (dateString: string) => string
}

export function ConnectedStoresList({ isMaintenance, formatDate }: ConnectedStoresListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Connected {isMaintenance ? "Stores" : "Maintenance Providers"}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Connected Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isMaintenance ? 
              managedStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {store.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(store.connectedSince)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              )) : 
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No maintenance providers connected yet.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
