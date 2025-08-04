import { supabase } from "@/integrations/supabase/client";

export const clearAllAuthState = () => {
  console.log("🧹 Clearing all authentication state...");
  
  // Clear localStorage auth tokens
  const keysToRemove = [
    'supabase.auth.token',
    'sb-qxutldpiaxfdicdsiomt-auth-token',
    'testMode',
    'testRole',
    'newAccount',
    'lastOperation'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log("✅ All auth state cleared");
};

export const performFullAuthReset = async () => {
  console.log("🔄 Performing full authentication reset...");
  
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all local state
    clearAllAuthState();
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("✅ Full auth reset completed");
    return true;
  } catch (error) {
    console.error("❌ Error during auth reset:", error);
    // Still clear local state even if signOut fails
    clearAllAuthState();
    return false;
  }
};

export const safeAuthStateReset = () => {
  console.log("🛡️ Performing safe auth state reset...");
  
  // Clear problematic auth tokens that might be corrupted
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-qxutldpiaxfdicdsiomt-auth-token');
  
  // Force refresh auth state
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log("🔍 Current session after reset:", session ? "Active" : "None");
  });
  
  console.log("✅ Safe auth reset completed");
};