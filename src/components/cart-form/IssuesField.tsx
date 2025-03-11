
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"

interface IssuesFieldProps {
  form: UseFormReturn<CartFormValues>
  disabled?: boolean
}

export function IssuesField({ form, disabled = false }: IssuesFieldProps) {
  return (
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
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
