
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      carts: {
        Row: {
          id: string
          qr_code: string  // Updated: Changed from rfidTag to qr_code
          store: string
          storeId: string
          status: "active" | "maintenance" | "retired"
          lastMaintenance: string
          issues: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          qr_code: string  // Updated: Changed from rfidTag to qr_code
          store: string
          storeId: string
          status: "active" | "maintenance" | "retired"
          lastMaintenance: string
          issues: string[]
          id?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          qr_code?: string  // Updated: Changed from rfidTag to qr_code
          store?: string
          storeId?: string
          status?: "active" | "maintenance" | "retired"
          lastMaintenance?: string
          issues?: string[]
          id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
