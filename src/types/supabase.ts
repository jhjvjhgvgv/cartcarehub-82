
export type Database = {
  public: {
    Tables: {
      carts: {
        Row: {
          id: string
          rfidTag: string
          store: string
          storeId: string
          status: "active" | "maintenance" | "retired"
          lastMaintenance: string
          issues: string[]
          created_at?: string
          updated_at?: string
        }
        Insert: Omit<Database['public']['Tables']['carts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['carts']['Row']>
      }
    }
  }
}
