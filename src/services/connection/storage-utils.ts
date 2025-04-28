
/**
 * Utilities to handle localStorage flags related to connection and onboarding,
 * and initialization of accounts and storage data.
 */

import { UserAccount, StoreAccount, MaintenanceAccount, StoreConnection } from "./types";

// Check if the current session is immediately after account creation (new account)
export function isNewAccountSession(): boolean {
  const newAccountFlag = localStorage.getItem("isNewAccountSession") === "true";
  const lastOp = localStorage.getItem("lastOperation");
  console.log("isNewAccountSession check:", newAccountFlag, "lastOperation:", lastOp);
  return newAccountFlag;
}

// Mark the session as a new account session (used after sign up)
export function setNewAccountSessionFlag(value: boolean) {
  console.log("setNewAccountSessionFlag:", value, "Stack trace:", new Error().stack);
  if (value) {
    localStorage.setItem("isNewAccountSession", "true");
  } else {
    localStorage.removeItem("isNewAccountSession");
  }
}

// Get stored connections from localStorage or empty array
export function getStoredConnections(): StoreConnection[] {
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
  // Always check if this is a new account session to avoid sample data
  const isNewAccount = isNewAccountSession();
  console.log("initializing store accounts, isNewAccount:", isNewAccount);
  
  // For new accounts, always return empty array
  if (isNewAccount || localStorage.getItem("lastOperation") === "signup") {
    console.log("NEW ACCOUNT DETECTED - returning empty store accounts");
    return [];
  }
  
  // For existing accounts, return empty array for now too
  console.log("EXISTING ACCOUNT DETECTED - still returning empty store accounts for consistency");
  return [];
}

// Initialize maintenance accounts - ALWAYS return empty array for new accounts
export function initializeMaintenanceAccounts(): MaintenanceAccount[] {
  // Always check if this is a new account session to avoid sample data
  const isNewAccount = isNewAccountSession();
  console.log("initializing maintenance accounts, isNewAccount:", isNewAccount);
  
  // For new accounts, always return empty array
  if (isNewAccount || localStorage.getItem("lastOperation") === "signup") {
    console.log("NEW ACCOUNT DETECTED - returning empty maintenance accounts");
    return [];
  }
  
  // For existing accounts, return empty array for now too
  console.log("EXISTING ACCOUNT DETECTED - still returning empty maintenance accounts for consistency");
  return [];
}

// Create or retrieve current user account from localStorage or default empty account
export function createUserAccountIfNeeded(): UserAccount {
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
