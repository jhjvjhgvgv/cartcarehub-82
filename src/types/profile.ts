export interface Profile {
  id: string;
  email?: string | null;
  display_name?: string | null;
  company_name?: string | null;
  contact_phone?: string | null;
  role?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_sign_in?: string | null;
}