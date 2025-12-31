export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          locked_until: string | null
          login_attempts: number
          password_hash: string
          permissions: Json
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number
          password_hash: string
          permissions?: Json
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number
          password_hash?: string
          permissions?: Json
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activities: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          ip_address: unknown
          success: boolean
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activities_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          store_org_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          store_org_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          store_org_id?: string | null
        }
        Relationships: []
      }
      cart_analytics: {
        Row: {
          cart_id: string
          created_at: string
          customer_satisfaction: number | null
          distance_traveled: number | null
          downtime_minutes: number | null
          id: string
          issues_reported: number | null
          maintenance_cost: number | null
          metric_date: string
          updated_at: string
          usage_hours: number | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          customer_satisfaction?: number | null
          distance_traveled?: number | null
          downtime_minutes?: number | null
          id?: string
          issues_reported?: number | null
          maintenance_cost?: number | null
          metric_date?: string
          updated_at?: string
          usage_hours?: number | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          customer_satisfaction?: number | null
          distance_traveled?: number | null
          downtime_minutes?: number | null
          id?: string
          issues_reported?: number | null
          maintenance_cost?: number | null
          metric_date?: string
          updated_at?: string
          usage_hours?: number | null
        }
        Relationships: []
      }
      cart_status_events: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          occurred_at: string
          source: string | null
          status: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          occurred_at?: string
          source?: string | null
          status: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          occurred_at?: string
          source?: string | null
          status?: Database["public"]["Enums"]["cart_status"]
          store_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      carts: {
        Row: {
          asset_tag: string | null
          created_at: string
          id: string
          model: string | null
          notes: string | null
          qr_token: string
          status: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
          updated_at: string
        }
        Insert: {
          asset_tag?: string | null
          created_at?: string
          id?: string
          model?: string | null
          notes?: string | null
          qr_token: string
          status?: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
          updated_at?: string
        }
        Update: {
          asset_tag?: string | null
          created_at?: string
          id?: string
          model?: string | null
          notes?: string | null
          qr_token?: string
          status?: Database["public"]["Enums"]["cart_status"]
          store_org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      company_settings: {
        Row: {
          branding: Json | null
          company_name: string
          company_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          settings: Json | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          company_name: string
          company_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          company_name?: string
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_name: string | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          provider_id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          provider_id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          cart_id: string
          checklist: Json
          created_at: string
          health_score: number
          id: string
          notes: string | null
          performed_by: string | null
          reported_status: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
        }
        Insert: {
          cart_id: string
          checklist?: Json
          created_at?: string
          health_score?: number
          id?: string
          notes?: string | null
          performed_by?: string | null
          reported_status?: Database["public"]["Enums"]["cart_status"]
          store_org_id: string
        }
        Update: {
          cart_id?: string
          checklist?: Json
          created_at?: string
          health_score?: number
          id?: string
          notes?: string | null
          performed_by?: string | null
          reported_status?: Database["public"]["Enums"]["cart_status"]
          store_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          item_code: string | null
          item_name: string
          provider_id: string
          quantity_on_hand: number
          reorder_level: number | null
          supplier_name: string | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_code?: string | null
          item_name: string
          provider_id: string
          quantity_on_hand?: number
          reorder_level?: number | null
          supplier_name?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_code?: string | null
          item_name?: string
          provider_id?: string
          quantity_on_hand?: number
          reorder_level?: number | null
          supplier_name?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          notes: string | null
          provider_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          notes?: string | null
          provider_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          provider_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          metadata: Json
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          metadata?: Json
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          metadata?: Json
          org_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          maintenance_request_id: string | null
          notes: string | null
          provider_id: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          maintenance_request_id?: string | null
          notes?: string | null
          provider_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          maintenance_request_id?: string | null
          notes?: string | null
          provider_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          actual_cost: number | null
          cart_id: string
          category: string | null
          created_at: string
          description: string | null
          detected_by: string | null
          est_cost: number | null
          id: string
          inspection_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status: string
          store_org_id: string
        }
        Insert: {
          actual_cost?: number | null
          cart_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          detected_by?: string | null
          est_cost?: number | null
          id?: string
          inspection_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: string
          store_org_id: string
        }
        Update: {
          actual_cost?: number | null
          cart_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          detected_by?: string | null
          est_cost?: number | null
          id?: string
          inspection_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: string
          store_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "maintenance_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_duration: number | null
          cart_id: string
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          notes: Json | null
          priority: string
          provider_id: string
          request_type: string
          scheduled_date: string | null
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          cart_id: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: Json | null
          priority?: string
          provider_id: string
          request_type: string
          scheduled_date?: string | null
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          cart_id?: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: Json | null
          priority?: string
          provider_id?: string
          request_type?: string
          scheduled_date?: string | null
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          cart_id: string
          created_at: string
          estimated_duration: number
          frequency: number
          id: string
          is_active: boolean
          last_completed: string | null
          maintenance_type: string
          next_due_date: string
          notes: string | null
          provider_id: string
          schedule_type: string
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          estimated_duration?: number
          frequency?: number
          id?: string
          is_active?: boolean
          last_completed?: string | null
          maintenance_type: string
          next_due_date: string
          notes?: string | null
          provider_id: string
          schedule_type: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          estimated_duration?: number
          frequency?: number
          id?: string
          is_active?: boolean
          last_completed?: string | null
          maintenance_type?: string
          next_due_date?: string
          notes?: string | null
          provider_id?: string
          schedule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          created_at: string | null
          current_step: number | null
          id: string
          is_completed: boolean | null
          onboarding_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          market: string | null
          name: string
          parent_org_id: string | null
          region: string | null
          settings: Json
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market?: string | null
          name: string
          parent_org_id?: string | null
          region?: string | null
          settings?: Json
          type: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market?: string | null
          name?: string
          parent_org_id?: string | null
          region?: string | null
          settings?: Json
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          contact_phone: string | null
          created_at: string
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          id: string
          is_active: boolean | null
          last_sign_in: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_step: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_analytics: {
        Row: {
          completed_work_orders: number | null
          created_at: string
          id: string
          labor_hours: number | null
          metrics: Json | null
          outstanding_invoices: number | null
          parts_used_count: number | null
          parts_used_value: number | null
          period_end: string
          period_start: string
          provider_id: string
          total_revenue: number | null
          total_work_orders: number | null
          updated_at: string
        }
        Insert: {
          completed_work_orders?: number | null
          created_at?: string
          id?: string
          labor_hours?: number | null
          metrics?: Json | null
          outstanding_invoices?: number | null
          parts_used_count?: number | null
          parts_used_value?: number | null
          period_end: string
          period_start: string
          provider_id: string
          total_revenue?: number | null
          total_work_orders?: number | null
          updated_at?: string
        }
        Update: {
          completed_work_orders?: number | null
          created_at?: string
          id?: string
          labor_hours?: number | null
          metrics?: Json | null
          outstanding_invoices?: number | null
          parts_used_count?: number | null
          parts_used_value?: number | null
          period_end?: string
          period_start?: string
          provider_id?: string
          total_revenue?: number | null
          total_work_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_store_links: {
        Row: {
          created_at: string
          id: string
          provider_org_id: string
          status: string
          store_org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_org_id: string
          status?: string
          store_org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_org_id?: string
          status?: string
          store_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "provider_store_links_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string | null
          notification_type: string
          provider_id: string
          recipient_email: string | null
          recipient_phone: string | null
          reference_id: string | null
          reference_type: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string | null
          notification_type: string
          provider_id: string
          recipient_email?: string | null
          recipient_phone?: string | null
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          provider_id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_daily_rollups: {
        Row: {
          day: string
          downtime_minutes: number
          inspections_count: number
          open_issues: number
          store_org_id: string
          total_carts: number
        }
        Insert: {
          day: string
          downtime_minutes?: number
          inspections_count?: number
          open_issues?: number
          store_org_id: string
          total_carts?: number
        }
        Update: {
          day?: string
          downtime_minutes?: number
          inspections_count?: number
          open_issues?: number
          store_org_id?: string
          total_carts?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "store_daily_rollups_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
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
            foreignKeyName: "store_provider_connections_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_provider_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_configuration_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          inventory_item_id: string | null
          line_type: string
          maintenance_request_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          inventory_item_id?: string | null
          line_type: string
          maintenance_request_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          inventory_item_id?: string | null
          line_type?: string
          maintenance_request_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_line_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_line_items_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          notes: string | null
          provider_org_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["work_order_status"]
          store_org_id: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          provider_org_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          store_org_id: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          provider_org_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          store_org_id?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
    }
    Views: {
      cart_alerts: {
        Row: {
          alert_high_severity_issue: boolean | null
          alert_low_health: boolean | null
          alert_overdue_inspection: boolean | null
          alert_repeat_issues: boolean | null
          asset_tag: string | null
          cart_id: string | null
          high_sev_open_count: number | null
          is_at_risk: boolean | null
          last_health_score: number | null
          last_inspected_at: string | null
          open_issue_count: number | null
          qr_token: string | null
          status: Database["public"]["Enums"]["cart_status"] | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_downtime_episodes: {
        Row: {
          cart_id: string | null
          down_start: string | null
          downtime_minutes: number | null
          store_org_id: string | null
          up_time: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_downtime_windows: {
        Row: {
          cart_id: string | null
          down_end: string | null
          down_start: string | null
          downtime_minutes: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_issue_counts: {
        Row: {
          cart_id: string | null
          high_sev_open_count: number | null
          open_issue_count: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_last_inspection: {
        Row: {
          cart_id: string | null
          last_inspected_at: string | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_last_score: {
        Row: {
          cart_id: string | null
          health_score: number | null
          scored_at: string | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "inspections_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_mtbf_segments: {
        Row: {
          cart_id: string | null
          minutes_between_failures: number | null
          next_down_start: string | null
          store_org_id: string | null
          up_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      cart_predictions: {
        Row: {
          cart_id: string | null
          days_until_maintenance: number | null
          maintenance_probability: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      carts_enriched: {
        Row: {
          asset_tag: string | null
          created_at: string | null
          high_sev_open_count: number | null
          id: string | null
          last_health_score: number | null
          last_inspected_at: string | null
          model: string | null
          notes: string | null
          open_issue_count: number | null
          qr_token: string | null
          status: Database["public"]["Enums"]["cart_status"] | null
          store_market: string | null
          store_name: string | null
          store_org_id: string | null
          store_region: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      carts_with_store: {
        Row: {
          asset_tag: string | null
          corp_org_id: string | null
          created_at: string | null
          id: string | null
          model: string | null
          notes: string | null
          qr_token: string | null
          status: Database["public"]["Enums"]["cart_status"] | null
          store_market: string | null
          store_name: string | null
          store_org_id: string | null
          store_region: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["corp_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      corp_kpis_30d: {
        Row: {
          corp_name: string | null
          corp_org_id: string | null
          downtime_minutes_30d: number | null
          inspections_30d: number | null
          market: string | null
          open_issues: number | null
          region: string | null
          store_count: number | null
          total_carts: number | null
        }
        Relationships: []
      }
      corp_preventive_kpis: {
        Row: {
          active_carts: number | null
          at_risk_carts: number | null
          avg_inspection_coverage_pct_30d: number | null
          avg_mtbf_minutes_30d: number | null
          avg_mttr_minutes_30d: number | null
          corp_name: string | null
          corp_org_id: string | null
          in_service_pct_now: number | null
          market: string | null
          out_of_service_now: number | null
          region: string | null
          store_count: number | null
          uptime_pct_30d: number | null
        }
        Relationships: []
      }
      issues_with_cart: {
        Row: {
          actual_cost: number | null
          asset_tag: string | null
          cart_id: string | null
          cart_model: string | null
          category: string | null
          created_at: string | null
          description: string | null
          detected_by: string | null
          est_cost: number | null
          id: string | null
          inspection_id: string | null
          qr_token: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["issue_severity"] | null
          status: string | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_alerts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_last_inspection"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart_predictions"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts_with_store"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "issues_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_current_availability: {
        Row: {
          active_carts: number | null
          in_service_now: number | null
          in_service_pct_now: number | null
          out_of_service_now: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_downtime_cost_30d: {
        Row: {
          downtime_cost_per_hour: number | null
          downtime_hours_30d: number | null
          downtime_minutes_30d: number | null
          estimated_downtime_cost_30d: number | null
          store_name: string | null
          store_org_id: string | null
        }
        Relationships: []
      }
      store_inspection_coverage_30d: {
        Row: {
          active_carts: number | null
          carts_inspected_30d: number | null
          inspection_coverage_pct_30d: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_inspection_coverage_7d: {
        Row: {
          active_carts: number | null
          carts_inspected_7d: number | null
          inspection_coverage_pct_7d: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "carts_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_kpis_30d: {
        Row: {
          downtime_minutes_30d: number | null
          inspections_30d: number | null
          open_issues: number | null
          store_name: string | null
          store_org_id: string | null
          total_carts: number | null
        }
        Relationships: []
      }
      store_mtbf_30d: {
        Row: {
          mtbf_minutes_30d: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_mttr_30d: {
        Row: {
          mttr_minutes_30d: number | null
          store_org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "cart_status_events_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
      store_preventive_kpis: {
        Row: {
          active_carts: number | null
          at_risk_carts: number | null
          downtime_minutes_30d: number | null
          high_sev_issue_carts: number | null
          in_service_now: number | null
          in_service_pct_now: number | null
          inspection_coverage_pct_30d: number | null
          low_health_carts: number | null
          mtbf_minutes_30d: number | null
          mttr_minutes_30d: number | null
          out_of_service_now: number | null
          overdue_inspection_carts: number | null
          repeat_issue_carts: number | null
          store_name: string | null
          store_org_id: string | null
          uptime_minutes_30d: number | null
          uptime_pct_30d: number | null
        }
        Relationships: []
      }
      store_uptime_kpis_30d: {
        Row: {
          active_carts: number | null
          downtime_minutes_30d: number | null
          store_name: string | null
          store_org_id: string | null
          uptime_minutes_30d: number | null
          uptime_pct_30d: number | null
        }
        Relationships: []
      }
      work_orders_with_store: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          provider_org_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["work_order_status"] | null
          store_market: string | null
          store_name: string | null
          store_org_id: string | null
          store_region: string | null
          summary: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_provider_org_id_fkey"
            columns: ["provider_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_kpis_30d"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "corp_preventive_kpis"
            referencedColumns: ["corp_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_downtime_cost_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_preventive_kpis"
            referencedColumns: ["store_org_id"]
          },
          {
            foreignKeyName: "work_orders_store_org_id_fkey"
            columns: ["store_org_id"]
            isOneToOne: false
            referencedRelation: "store_uptime_kpis_30d"
            referencedColumns: ["store_org_id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      admin_manage_user: {
        Args: {
          p_action: string
          p_new_role?: string
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      authenticate_admin: {
        Args: {
          p_ip_address?: unknown
          p_password: string
          p_user_agent?: string
          p_username: string
        }
        Returns: Json
      }
      bulk_update_cart_status: {
        Args: { cart_ids: string[]; new_status: string; updated_by?: string }
        Returns: Json
      }
      calculate_provider_revenue: {
        Args: {
          p_end_date: string
          p_provider_id: string
          p_start_date: string
        }
        Returns: number
      }
      create_org_with_owner: {
        Args: {
          p_market?: string
          p_name: string
          p_owner_role?: Database["public"]["Enums"]["membership_role"]
          p_parent_org_id?: string
          p_region?: string
          p_type: Database["public"]["Enums"]["org_type"]
        }
        Returns: string
      }
      current_user_can_access_store_as_provider: {
        Args: { _store_org: string }
        Returns: boolean
      }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_cart_analytics_summary: {
        Args: { date_from?: string; date_to?: string; store_id_param?: string }
        Returns: Json
      }
      get_current_user_role: { Args: never; Returns: string }
      get_low_inventory_items: {
        Args: { p_provider_id: string }
        Returns: {
          id: string
          item_name: string
          quantity_on_hand: number
          reorder_level: number
        }[]
      }
      get_user_primary_role: { Args: { _user_id: string }; Returns: string }
      get_user_role: { Args: { user_id: string }; Returns: string }
      has_admin_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      has_role:
        | {
            Args: {
              _org: string
              _role: Database["public"]["Enums"]["membership_role"]
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_admin_user: { Args: never; Returns: boolean }
      is_maintenance_provider: { Args: { user_id: string }; Returns: boolean }
      is_member: { Args: { _org: string }; Returns: boolean }
      is_org_admin: { Args: { _org: string }; Returns: boolean }
      log_admin_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_error_message?: string
          p_success?: boolean
          p_target_id?: string
          p_target_type: string
        }
        Returns: undefined
      }
      log_system_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      logout_admin: { Args: { p_session_token: string }; Returns: Json }
      provider_has_store_access: {
        Args: { _provider_org: string; _store_org: string }
        Returns: boolean
      }
      rollup_store_day: { Args: { p_day: string }; Returns: undefined }
      safe_user_setup: { Args: { user_id_param: string }; Returns: Json }
      schedule_maintenance_requests: { Args: never; Returns: Json }
      submit_inspection_by_qr: {
        Args: {
          p_checklist?: Json
          p_health_score: number
          p_issue_category?: string
          p_issue_description?: string
          p_issue_severity?: Database["public"]["Enums"]["issue_severity"]
          p_notes?: string
          p_qr_token: string
          p_reported_status: Database["public"]["Enums"]["cart_status"]
        }
        Returns: {
          cart_id: string
          inspection_id: string
          issue_id: string
          store_org_id: string
        }[]
      }
      sync_user_roles_from_metadata: { Args: never; Returns: undefined }
      user_can_access_store: { Args: { _store_org: string }; Returns: boolean }
      user_has_maintenance_profile: {
        Args: { user_id: string }
        Returns: boolean
      }
      verify_admin_session: { Args: { p_session_token: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "maintenance" | "store"
      cart_status: "in_service" | "out_of_service" | "retired"
      invitation_status: "pending" | "accepted" | "rejected"
      issue_severity: "low" | "medium" | "high" | "critical"
      membership_role:
        | "corp_admin"
        | "corp_viewer"
        | "store_admin"
        | "store_viewer"
        | "provider_admin"
        | "provider_tech"
      org_type: "corporation" | "store" | "provider"
      work_order_status:
        | "new"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "canceled"
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
      app_role: ["admin", "maintenance", "store"],
      cart_status: ["in_service", "out_of_service", "retired"],
      invitation_status: ["pending", "accepted", "rejected"],
      issue_severity: ["low", "medium", "high", "critical"],
      membership_role: [
        "corp_admin",
        "corp_viewer",
        "store_admin",
        "store_viewer",
        "provider_admin",
        "provider_tech",
      ],
      org_type: ["corporation", "store", "provider"],
      work_order_status: [
        "new",
        "scheduled",
        "in_progress",
        "completed",
        "canceled",
      ],
    },
  },
} as const
