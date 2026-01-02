import type { Tables } from "@/integrations/supabase/types";

// Base Cart type matches the Supabase carts table exactly
// Columns: id, created_at, updated_at, store_org_id, asset_tag, qr_token, status, model, notes
export type Cart = Tables<"carts">;

// Alias for clarity
export type CartRow = Cart;

// Cart status type from database enum - CANONICAL values
export type CartStatus = 'in_service' | 'out_of_service' | 'retired';

// Extended type matching carts_enriched view (cart + store info + last inspection + issues)
export interface CartEnriched extends Cart {
  store_name?: string | null;
  store_market?: string | null;
  store_region?: string | null;
  last_inspected_at?: string | null;
  last_health_score?: number | null;
  open_issue_count?: number | null;
  high_sev_open_count?: number | null;
}

// Extended type matching carts_with_predictions view (enriched + predictions)
export interface CartWithPrediction extends CartEnriched {
  maintenance_probability?: number | null;
  days_until_maintenance?: number | null;
}

// Legacy type alias - use CartEnriched instead
export interface CartWithStore extends Cart {
  store_name?: string | null;
  store_market?: string | null;
  store_region?: string | null;
}

// Legacy type alias - use CartEnriched instead
export interface CartWithIssues extends Cart {
  open_issue_count?: number;
  high_sev_open_count?: number;
}

// Full cart view with store and issues - use CartEnriched
export type CartFullView = CartEnriched;

// Maintenance prediction - use maintenance_probability / days_until_maintenance on CartWithPrediction
export interface MaintenancePrediction {
  maintenance_probability: number; // 0..1
  days_until_maintenance: number | null; // null if insufficient data
}

// Helper to map status to display label
export function getStatusLabel(status: CartStatus | string): string {
  switch (status) {
    case 'in_service':
      return 'Active';
    case 'out_of_service':
      return 'Maintenance';
    case 'retired':
      return 'Retired';
    default:
      return String(status);
  }
}

// Helper to map display label to status
export function getStatusValue(label: string): CartStatus {
  switch (label.toLowerCase()) {
    case 'active':
    case 'in_service':
      return 'in_service';
    case 'maintenance':
    case 'out_of_service':
      return 'out_of_service';
    case 'retired':
      return 'retired';
    default:
      return 'in_service';
  }
}

// Type guard to check if cart has prediction data from DB
export function hasDbPrediction(cart: Cart | CartWithPrediction): cart is CartWithPrediction {
  return 'maintenance_probability' in cart && 
    typeof (cart as CartWithPrediction).maintenance_probability === 'number';
}
