
/**
 * Utilities to handle localStorage flags related to connection and onboarding,
 * and initialization of accounts and storage data.
 */

import { UserAccount, StoreAccount, MaintenanceAccount, StoreConnection } from "./types";

// Check if the current session is immediately after account creation (new account)
export function isNewAccountSession(): boolean {
  const newAccountFlag = localStorage.getItem("isNewAccountSession") === "true";
  const lastOp = localStorage.getItem("lastOperation") === "signup";
  console.log("isNewAccountSession check:", newAccountFlag || lastOp, "lastOperation:", lastOp, "newAccountFlag:", newAccountFlag);
  
  // Return true if EITHER flag is set - this is more reliable
  return newAccountFlag || lastOp;
}

// Mark the session as a new account session (used after sign up)
export function setNewAccountSessionFlag(value: boolean) {
  console.log("setNewAccountSessionFlag:", value, "Stack trace:", new Error().stack);
  if (value) {
    localStorage.setItem("isNewAccountSession", "true");
    console.log("Set new account flag to true");
  } else {
    localStorage.removeItem("isNewAccountSession");
    console.log("Removed new account flag");
  }
}

// Get stored connections from localStorage or empty array
export function getStoredConnections(): StoreConnection[] {
  // ALWAYS check if this is a new account first
  if (isNewAccountSession()) {
    console.log("getStoredConnections - NEW ACCOUNT - returning empty array");
    return [];
  }

  const stored = localStorage.getItem('storeConnections');
  if (!stored) return [];
  try {
    const connections = JSON.parse(stored) as StoreConnection[];
    if (Array.isArray(connections)) {
      return connections;
    }
    return [];
  } catch {
    return [];
  }
}

// Initialize store accounts - ALWAYS return empty array for new accounts
export function initializeStoreAccounts(): StoreAccount[] {
  // Always check if this is a new account session before doing anything
  const isNewAccount = isNewAccountSession();
  console.log("initializing store accounts, isNewAccount:", isNewAccount);
  
  // For new accounts, always return empty array
  if (isNewAccount) {
    console.log("NEW ACCOUNT DETECTED - returning empty store accounts");
    return [];
  }
  
  // For existing accounts, return empty array for now too
  console.log("EXISTING ACCOUNT DETECTED - still returning empty store accounts for consistency");
  return [];
}

// Initialize maintenance accounts - ALWAYS return empty array for new accounts
export function initializeMaintenanceAccounts(): MaintenanceAccount[] {
  // Always check if this is a new account session before doing anything
  const isNewAccount = isNewAccountSession();
  console.log("initializing maintenance accounts, isNewAccount:", isNewAccount);
  
  // For new accounts, always return empty array
  if (isNewAccount) {
    console.log("NEW ACCOUNT DETECTED - returning empty maintenance accounts");
    return [];
  }
  
  // For existing accounts, return empty array for now too
  console.log("EXISTING ACCOUNT DETECTED - still returning empty maintenance accounts for consistency");
  return [];
}

// Create or retrieve current user account from localStorage or default empty account
export function createUserAccountIfNeeded(): UserAccount {
  // FIRST check if this is a new account session
  if (isNewAccountSession()) {
    // For new accounts, always create a fresh user account
    console.log("Creating empty user account for NEW ACCOUNT");
    const emptyUser: UserAccount = {
      id: '',
      name: '',
      type: 'store',
    };
    localStorage.setItem('currentUser', JSON.stringify(emptyUser));
    return emptyUser;
  }
  
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      return JSON.parse(stored) as UserAccount;
    } catch {
      // ignore
    }
  }
  
  // Return empty user
  const emptyUser: UserAccount = {
    id: '',
    name: '',
    type: 'store',
  };
  localStorage.setItem('currentUser', JSON.stringify(emptyUser));
  return emptyUser;
}

// Clear new account flags - used after user has seen the welcome screen
export function clearNewAccountFlags(immediate = false) {
  console.log("Clearing new account flags, immediate:", immediate);
  
  if (immediate) {
    localStorage.removeItem("isNewAccountSession");
    localStorage.removeItem("lastOperation");
    console.log("Immediately cleared all new account flags");
  } else {
    // Clear with a delay to ensure welcome screen is shown
    setTimeout(() => {
      localStorage.removeItem("isNewAccountSession");
      console.log("Cleared isNewAccountSession flag with delay");
      
      // Clear lastOperation after another delay
      setTimeout(() => {
        localStorage.removeItem("lastOperation");
        console.log("Cleared lastOperation flag with additional delay");
      }, 5000);
    }, 1000);
  }
}

// Clear new account flags when user navigates to settings to start setup
export function clearFlagsOnSettingsNavigation(): void {
  console.log("Clearing new account flags on settings navigation");
  // Clear flags when user actively navigates to settings to start setup
  setTimeout(() => {
    localStorage.removeItem("isNewAccountSession");
    localStorage.removeItem("lastOperation");
    console.log("New account flags cleared on settings navigation");
  }, 500);
}
