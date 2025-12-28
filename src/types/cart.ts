import type { Tables } from "@/integrations/supabase/types";

// Base Cart type matches the Supabase row shape exactly
export type Cart = Tables<"carts">;

// Cart status type from database enum
export type CartStatus = 'in_service' | 'out_of_service' | 'retired';

// Extended type with organization info when joined
export interface CartWithStore extends Cart {
  store?: {
    id: string;
    name: string;
    market?: string | null;
    region?: string | null;
  } | null;
}

// Extended type with issues when fetched separately
export interface CartWithIssues extends Cart {
  issues?: Array<{
    id: string;
    description: string | null;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    created_at: string;
  }>;
}

// Full cart view with all related data
export interface CartFullView extends CartWithStore {
  issues?: Array<{
    id: string;
    description: string | null;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    created_at: string;
  }>;
  inspections?: Array<{
    id: string;
    health_score: number;
    created_at: string;
    reported_status: CartStatus;
  }>;
}
