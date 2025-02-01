import React from "react"
import { CartForm } from "@/components/cart-form"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { Cart } from "@/types/cart"

interface SingleCartEditProps {
  cart: Cart
  onSubmit: (data: any) => void
  onCancel: () => void
  onDelete: (cartId: string) => void
}

export function SingleCartEdit({ cart, onSubmit, onCancel, onDelete }: SingleCartEditProps) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(cart.id)}
          className="h-8 w-8 p-0 hover:bg-red-50"
        >
          <Trash2Icon className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      <CartForm
        initialData={{
          rfidTag: cart.rfidTag || "",
          store: cart.store || "",
          status: cart.status || "active",
          lastMaintenance: cart.lastMaintenance || "",
          issues: cart.issues ? cart.issues.join("\n") : "",
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        disableRfidTag={false}
        rfidPlaceholder={cart.rfidTag}
      />
    </div>
  )
}