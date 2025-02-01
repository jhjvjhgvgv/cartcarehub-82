import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"

const managedStores = [
  { id: "store1", name: "SuperMart Downtown" },
  { id: "store2", name: "FreshMart Heights" },
]

interface StoreFieldProps {
  form: UseFormReturn<CartFormValues>
}

export function StoreField({ form }: StoreFieldProps) {
  return (
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
  )
}