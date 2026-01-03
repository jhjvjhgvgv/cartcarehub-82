// Session debugging and cleanup utilities
import { supabase } from "@/integrations/supabase/client";

export const clearAllSessionData = () => {
  console.log("🧹 Clearing all session data...");
  
  // Clear localStorage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-qxutldpiaxfdicdsiomt-auth-token');
  localStorage.removeItem('testMode');
  localStorage.removeItem('testRole');
  localStorage.removeItem('newAccount');
  localStorage.removeItem('newAccountSession');
  localStorage.removeItem('lastOperation');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log("✅ Session data cleared");
};

export const logCurrentSessionState = async () => {
  console.log("🔍 Current session state debug:");
  
  try {
    const { data: session, error } = await supabase.auth.getSession();
    console.log("Session data:", session?.session ? "Has session" : "No session");
    console.log("Session error:", error);
    
    if (session?.session?.user) {
      console.log("User ID:", session.session.user.id);
      console.log("User email:", session.session.user.email);
      console.log("User metadata:", session.session.user.user_metadata);
      
      // Try to get user's org membership
      const { data: membership, error: membershipError } = await supabase
        .from('org_memberships')
        .select('role, org_id')
        .eq('user_id', session.session.user.id)
        .limit(1)
        .maybeSingle();
        
      console.log("Membership data:", membership);
      console.log("Membership error:", membershipError);
    }
    
    // Check localStorage
    console.log("localStorage items:");
    console.log("- testMode:", localStorage.getItem('testMode'));
    console.log("- testRole:", localStorage.getItem('testRole'));
    console.log("- newAccount:", localStorage.getItem('newAccount'));
    console.log("- lastOperation:", localStorage.getItem('lastOperation'));
    
  } catch (error) {
    console.error("Error checking session state:", error);
  }
};

export const safeSignOut = async () => {
  console.log("🚪 Performing safe sign out...");
  
  try {
    // First clear local storage
    clearAllSessionData();
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    } else {
      console.log("✅ Signed out successfully");
    }
  } catch (error) {
    console.error("Error during sign out:", error);
  }
  
  // Force reload to ensure clean state
  window.location.href = '/';
};