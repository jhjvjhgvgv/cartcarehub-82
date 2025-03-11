
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { RfidField } from "./cart-form/RfidField"
import { StoreField } from "./cart-form/StoreField"
import { StatusField } from "./cart-form/StatusField"
import { IssuesField } from "./cart-form/IssuesField"
import { cartFormSchema, CartFormValues } from "./cart-form/types"
import { Card } from "./ui/card"
import { ShoppingCart, Loader2 } from "lucide-react"
import { Cart } from "@/types/cart"

interface CartFormProps {
  initialData?: CartFormValues
  onSubmit: (data: CartFormValues) => void
  onCancel: () => void
  disableRfidTag?: boolean
  isBulkEdit?: boolean
  rfidPlaceholder?: string
  carts?: Cart[]
  onDelete?: (cartId: string) => void
  disabled?: boolean
}

export function CartForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  disableRfidTag = false,
  isBulkEdit = false,
  rfidPlaceholder = "Enter QR code",
  carts = [],
  onDelete = () => {},
  disabled = false,
}: CartFormProps) {
  const form = useForm<CartFormValues>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: initialData || {
      qr_code: "",
      store: "",
      status: "active",
      issues: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const handleSubmit = (data: CartFormValues) => {
    const modifiedValues: Partial<CartFormValues> = {}

    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof CartFormValues
      if (initialData && data[fieldKey] !== initialData[fieldKey]) {
        if (fieldKey === 'status') {
          const status = data[fieldKey]
          if (status === 'active' || status === 'maintenance' || status === 'retired') {
            modifiedValues[fieldKey] = status
          }
        } else {
          modifiedValues[fieldKey] = data[fieldKey]
        }
      }
    })

    if (isBulkEdit || (disableRfidTag && initialData?.qr_code)) {
      delete modifiedValues.qr_code
    }

    onSubmit({
      ...initialData,
      ...modifiedValues,
    } as CartFormValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {!initialData && !isBulkEdit && (
            <Card className="p-4 flex items-center space-x-4 border-2 border-dashed">
              <ShoppingCart className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium">Add New Cart</h3>
                <p className="text-sm text-muted-foreground">Fill in the details below</p>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-4 space-y-4">
          <RfidField 
            form={form} 
            disabled={disableRfidTag || disabled}
            placeholder={rfidPlaceholder}
            carts={carts}
            onSubmit={onSubmit}
            onDelete={onDelete}
          />
          <StoreField form={form} disabled={disabled} />
          <StatusField form={form} disabled={disabled} />
          <IssuesField form={form} disabled={disabled} />
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
