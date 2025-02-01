import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const managedStores = [
  { id: "store1", name: "SuperMart Downtown" },
  { id: "store2", name: "FreshMart Heights" },
]

const cartFormSchema = z.object({
  rfidTag: z.string().min(1, "RFID tag is required"),
  store: z.string().min(1, "Store is required"),
  status: z.enum(["active", "maintenance", "retired"]),
  lastMaintenance: z.string().min(1, "Last maintenance date is required"),
  issues: z.string().optional(),
})

type CartFormValues = z.infer<typeof cartFormSchema>

interface CartFormProps {
  initialData?: CartFormValues
  onSubmit: (data: CartFormValues) => void
  onCancel: () => void
  disableRfidTag?: boolean
  isBulkEdit?: boolean
  rfidPlaceholder?: string
}

export function CartForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  disableRfidTag = false,
  isBulkEdit = false,
  rfidPlaceholder = "Enter RFID tag"
}: CartFormProps) {
  const form = useForm<CartFormValues>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: initialData || {
      rfidTag: "",
      store: "",
      status: "active",
      lastMaintenance: new Date().toISOString().split("T")[0],
      issues: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rfidTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFID Tag</FormLabel>
              <FormControl>
                <Input 
                  placeholder={rfidPlaceholder}
                  {...field} 
                  disabled={disableRfidTag}
                  className={disableRfidTag ? "bg-gray-100" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {managedStores.map((store) => (
                    <SelectItem key={store.id} value={store.name}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastMaintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Maintenance Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issues</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe any issues or maintenance notes"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Cart</Button>
        </div>
      </form>
    </Form>
  )
}