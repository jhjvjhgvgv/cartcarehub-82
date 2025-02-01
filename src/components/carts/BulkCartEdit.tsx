import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartForm } from "@/components/cart-form"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { Cart } from "@/types/cart"

interface BulkCartEditProps {
  editingCart: Cart
  cartIds: string[]
  onSubmit: (data: any) => void
  onCancel: () => void
  onDelete: (cartId: string) => void
}

export function BulkCartEdit({ editingCart, cartIds, onSubmit, onCancel, onDelete }: BulkCartEditProps) {
  // Get the original cart if only one is selected
  const singleCart = cartIds.length === 1 ? editingCart?.originalCarts?.find(cart => cart.id === cartIds[0]) : null

  return (
    <Tabs defaultValue="individual" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="individual">Individual Edits</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Edit</TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {cartIds.map((cartId) => {
              const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)
              return (
                <div key={cartId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-medium">Cart ID: {cartId}</h4>
                      <p className="text-sm text-muted-foreground">RFID: {originalCart?.rfidTag}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(cartId)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <CartForm
                    initialData={{
                      rfidTag: originalCart?.rfidTag || "",
                      store: originalCart?.store || "",
                      status: originalCart?.status || "active",
                      lastMaintenance: originalCart?.lastMaintenance || "",
                      issues: originalCart?.issues ? originalCart.issues.join("\n") : "",
                    }}
                    onSubmit={(data) => onSubmit({ ...data, id: cartId })}
                    onCancel={onCancel}
                    disableRfidTag={true}
                    rfidPlaceholder={originalCart?.rfidTag}
                  />
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="bulk">
        <CartForm
          initialData={{
            rfidTag: singleCart?.rfidTag || "Multiple RFIDs",
            store: editingCart?.store || "",
            status: editingCart?.status || "active",
            lastMaintenance: editingCart?.lastMaintenance || "",
            issues: editingCart?.issues ? editingCart.issues.join("\n") : "",
          }}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disableRfidTag={true}
          isBulkEdit={true}
          rfidPlaceholder={singleCart?.rfidTag || "Multiple RFIDs - Will Be Preserved"}
        />
      </TabsContent>
    </Tabs>
  )
}