
import { UserAccount } from "@/services/connection/types"

interface AccountIdentifierProps {
  currentUser: UserAccount
  isMaintenance: boolean
}

export function AccountIdentifier({ currentUser, isMaintenance }: AccountIdentifierProps) {
  return (
    <div className="p-4 border rounded-md bg-muted/50">
      <p className="text-sm font-medium mb-1">Your {isMaintenance ? "Maintenance Provider" : "Store"} ID:</p>
      <code className="text-sm bg-background px-2 py-1 rounded border">
        {currentUser.id}
      </code>
      <p className="text-xs text-muted-foreground mt-2">
        Share this ID with {isMaintenance ? "stores" : "maintenance providers"} who want to connect with you.
      </p>
    </div>
  )
}
