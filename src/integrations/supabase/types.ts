export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      carts: {
        Row: {
          created_at: string
          id: string
          issues: string[]
          last_maintenance: string
          maintenance_history: Json | null
          qr_code: string
          status: string
          store: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          issues?: string[]
          last_maintenance: string
          maintenance_history?: Json | null
          qr_code: string
          status: string
          store: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          issues?: string[]
          last_maintenance?: string
          maintenance_history?: Json | null
          qr_code?: string
          status?: string
          store?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_providers: {
        Row: {
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          updated_at: string
          user_id: string
          verification_date: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          contact_phone: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_sign_in: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_provider_connections: {
        Row: {
          created_at: string
          id: string
          initiated_by: string
          provider_id: string
          status: Database["public"]["Enums"]["invitation_status"] | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by: string
          provider_id: string
          status?: Database["public"]["Enums"]["invitation_status"] | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by?: string
          provider_id?: string
          status?: Database["public"]["Enums"]["invitation_status"] | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_provider_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_maintenance_provider: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      invitation_status: ["pending", "accepted", "rejected"],
    },
  },
} as const
