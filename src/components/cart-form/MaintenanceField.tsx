import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"

interface MaintenanceFieldProps {
  form: UseFormReturn<CartFormValues>
}

export function MaintenanceField({ form }: MaintenanceFieldProps) {
  return (
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
  )
}