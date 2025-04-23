
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

// Initialize store accounts - mock or retrieve from localStorage
export function initializeStoreAccounts(): StoreAccount[] {
  const stored = localStorage.getItem('storeAccounts');
  if (!stored) return [];
  try {
    const stores = JSON.parse(stored) as StoreAccount[];
    if (Array.isArray(stores)) {
      return stores;
    }
    return [];
  } catch {
    return [];
  }
}

// Initialize maintenance accounts - mock or retrieve from localStorage
export function initializeMaintenanceAccounts(): MaintenanceAccount[] {
  const stored = localStorage.getItem('maintenanceAccounts');
  if (!stored) return [];
  try {
    const maintenance = JSON.parse(stored) as MaintenanceAccount[];
    if (Array.isArray(maintenance)) {
      return maintenance;
    }
    return [];
  } catch {
    return [];
  }
}

// Create or retrieve current user account from localStorage or default
export function createUserAccountIfNeeded(
  stores: StoreAccount[],
  maintenance: MaintenanceAccount[]
): UserAccount {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      return JSON.parse(stored) as UserAccount;
    } catch {
      // ignore
    }
  }
  // If no user stored, create default user (empty or first store or maintenance)
  if (maintenance.length > 0) {
    const user = maintenance[0] as UserAccount;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  if (stores.length > 0) {
    const user = stores[0] as UserAccount;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  // Fallback empty user
  const emptyUser: UserAccount = {
    id: '',
    name: '',
    type: 'store',
  };
  localStorage.setItem('currentUser', JSON.stringify(emptyUser));
  return emptyUser;
}

