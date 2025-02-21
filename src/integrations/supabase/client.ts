
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://qxutldpiaxfdicdsiomt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXRsZHBpYXhmZGljZHNpb210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NjU5MTAsImV4cCI6MjA1MzI0MTkxMH0.GqZjfLjSo6CQfJc-ynvDGD4V6j2lFyBDHBXac0F92bw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
