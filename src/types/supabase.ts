
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
          qr_code: string
          store: string
          store_id: string
          status: "active" | "maintenance" | "retired"
          last_maintenance: string | null // Changed from lastMaintenance to last_maintenance
          issues: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          qr_code: string
          store: string
          store_id: string
          status: "active" | "maintenance" | "retired"
          last_maintenance?: string | null // Changed from lastMaintenance to last_maintenance
          issues: string[]
          id?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          qr_code?: string
          store?: string
          store_id?: string
          status?: "active" | "maintenance" | "retired"
          last_maintenance?: string | null // Changed from lastMaintenance to last_maintenance
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
