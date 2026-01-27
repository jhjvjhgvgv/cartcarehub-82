import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cartFormSchema, CartFormValues } from "./cart-form/types"
import { Card } from "./ui/card"
import { ShoppingCart, Loader2 } from "lucide-react"

interface CartFormProps {
  initialData?: CartFormValues
  onSubmit: (data: CartFormValues) => void
  onCancel: () => void
  disabled?: boolean
  stores?: Array<{ id: string; name: string }>
}

export function CartForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  disabled = false,
  stores = [],
}: CartFormProps) {
  const form = useForm<CartFormValues>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: initialData || {
      qr_token: "",
      store_org_id: stores[0]?.id || "",
      status: "in_service",
      notes: "",
      asset_tag: "",
      model: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const handleSubmit = (data: CartFormValues) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!initialData && (
          <Card className="p-4 flex items-center space-x-4 border-2 border-dashed">
            <ShoppingCart className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium">Add New Cart</h3>
              <p className="text-sm text-muted-foreground">Fill in the details below</p>
            </div>
          </Card>
        )}

        <Card className="p-4 space-y-4">
          <FormField
            control={form.control}
            name="qr_token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>QR Token</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter QR token (auto-generated if empty)" disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asset_tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Tag (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., CART-001" disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="store_org_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store</FormLabel>
                {stores.length > 0 ? (
                  <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input {...field} placeholder="No stores available" disabled />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover">
                    <SelectItem value="in_service">Active</SelectItem>
                    <SelectItem value="out_of_service">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Cart model" disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Additional notes" disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
          <Button type="submit" disabled={disabled || stores.length === 0}>
            {disabled ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
