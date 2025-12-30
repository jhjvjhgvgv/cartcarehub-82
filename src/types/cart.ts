import type { Tables } from "@/integrations/supabase/types";

// Base Cart type matches the Supabase row shape exactly
// Columns: id, created_at, updated_at, store_org_id, asset_tag, qr_token, status, model, notes
export type Cart = Tables<"carts">;

// Alias for clarity
export type CartRow = Cart;

// Cart status type from database enum
export type CartStatus = 'in_service' | 'out_of_service' | 'retired';

// Extended type with organization info when joined (via carts_with_store view or manual join)
export interface CartWithStore extends Cart {
  store_name?: string | null;
  store_market?: string | null;
  store_region?: string | null;
}

// Extended type with issue counts (computed from issues query)
export interface CartWithIssues extends Cart {
  open_issue_count?: number;
  high_sev_open_count?: number;
}

// Full cart view with store and issues
export interface CartFullView extends CartWithStore, CartWithIssues {}

// Maintenance prediction computed from inspections/issues
export interface MaintenancePrediction {
  maintenance_probability: number; // 0..1
  days_until_maintenance: number | null; // null if insufficient data
}

// Cart with prediction data for predictive maintenance
export interface CartWithPrediction extends Cart {
  prediction: MaintenancePrediction;
}

// Helper to map status to display label
export function getStatusLabel(status: CartStatus): string {
  switch (status) {
    case 'in_service':
      return 'Active';
    case 'out_of_service':
      return 'Maintenance';
    case 'retired':
      return 'Retired';
    default:
      return status;
  }
}

// Helper to map display label to status
export function getStatusValue(label: string): CartStatus {
  switch (label.toLowerCase()) {
    case 'active':
      return 'in_service';
    case 'maintenance':
      return 'out_of_service';
    case 'retired':
      return 'retired';
    default:
      return 'in_service';
  }
}
