import { z } from "zod"

export const cartFormSchema = z.object({
  qr_token: z.string().min(1, "QR token is required"),
  store_org_id: z.string().min(1, "Store is required"),
  status: z.enum(["in_service", "out_of_service", "retired"]),
  notes: z.string().optional(),
  asset_tag: z.string().optional(),
  model: z.string().optional(),
})

export type CartFormValues = z.infer<typeof cartFormSchema>
