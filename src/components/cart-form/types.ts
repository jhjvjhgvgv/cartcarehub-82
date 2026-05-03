import { z } from "zod"

// Standard UUID v1-v5 pattern – we explicitly REJECT these to prevent
// auto-generated junk tokens that don't match a physical QR sticker.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Canonical QR token format: uppercase letters, digits, hyphens, min 6 chars.
const QR_TOKEN_REGEX = /^[A-Z0-9-]{6,}$/

export const normalizeAssetTag = (raw?: string | null): string | null => {
  if (!raw) return null
  // Replace any unicode dash (U+2010..U+2015), en/em dashes, minus, and whitespace
  // with a standard ASCII hyphen, collapse repeats, then trim and uppercase.
  const cleaned = raw
    .replace(/[\s\u2010-\u2015\u2212]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim()
    .toUpperCase()
  return cleaned.length ? cleaned : null
}

export const cartFormSchema = z.object({
  qr_token: z
    .string()
    .trim()
    .min(1, "QR token is required – scan a physical QR or enter the token manually")
    .refine((v) => !UUID_REGEX.test(v), {
      message: "QR token cannot be an auto-generated UUID. Scan the physical sticker.",
    })
    .refine((v) => QR_TOKEN_REGEX.test(v), {
      message: "QR token must be uppercase A-Z, 0-9, or '-' (min 6 chars).",
    }),
  store_org_id: z.string().uuid("A valid store must be selected"),
  status: z.enum(["in_service", "out_of_service", "retired"]),
  notes: z.string().max(2000).optional(),
  asset_tag: z
    .string()
    .max(64)
    .optional()
    .transform((v) => normalizeAssetTag(v ?? null) ?? undefined),
  model: z.string().max(128).optional(),
})

export type CartFormValues = z.infer<typeof cartFormSchema>
