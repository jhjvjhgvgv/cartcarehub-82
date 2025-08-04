/**
 * Utility to clear all cached data and refresh the app state
 * Use this when accounts have been deleted or when starting fresh
 */

export const clearAllAppData = () => {
  console.log("🧹 Clearing all app data and cache...");
  
  // Clear authentication related data
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-qxutldpiaxfdicdsiomt-auth-token');
  
  // Clear new account session flags
  localStorage.removeItem("isNewAccountSession");
  localStorage.removeItem("lastOperation");
  
  // Clear test mode data
  localStorage.removeItem("testMode");
  localStorage.removeItem("testRole");
  
  // Clear connection data
  localStorage.removeItem('storeConnections');
  localStorage.removeItem('currentUser');
  
  // Clear quick actions
  localStorage.removeItem("quickActions");
  
  // Clear any other app-specific data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('cart-') ||
      key.startsWith('maintenance-') ||
      key.startsWith('store-') ||
      key.startsWith('profile-') ||
      key.includes('supabase')
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log("✅ All app data cleared successfully");
};

export const refreshAppState = () => {
  console.log("🔄 Refreshing app state...");
  
  // Clear all data first
  clearAllAppData();
  
  // Force a page reload to ensure clean state
  window.location.reload();
};