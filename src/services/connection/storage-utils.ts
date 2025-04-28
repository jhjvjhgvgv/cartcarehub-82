
/**
 * Utilities to handle localStorage flags related to connection and onboarding,
 * and initialization of accounts and storage data.
 */

import { UserAccount, StoreAccount, MaintenanceAccount, StoreConnection } from "./types";

// Check if the current session is immediately after account creation (new account)
export function isNewAccountSession(): boolean {
  return localStorage.getItem("isNewAccountSession") === "true";
}

// Mark the session as a new account session (used after sign up)
export function setNewAccountSessionFlag(value: boolean) {
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

// Initialize store accounts - always start empty
export function initializeStoreAccounts(): StoreAccount[] {
  return [];
}

// Initialize maintenance accounts - always start empty
export function initializeMaintenanceAccounts(): MaintenanceAccount[] {
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
