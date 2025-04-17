
import { StoreAccount, MaintenanceAccount, StoreConnection, UserAccount } from "./types";

// Helper function to generate a unique ID with prefix
export const generateUniqueId = (prefix: string): string => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomPart}`;
};

// Get stored accounts or initialize with empty array for new accounts
export const getStoredAccounts = <T>(key: string, samples: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Always initialize with empty array for new accounts
  localStorage.setItem(key, JSON.stringify([]));
  return [];
};

// Initialize store accounts - with empty arrays for new accounts
export const initializeStoreAccounts = (): StoreAccount[] => {
  // Check if this is a new account session
  const isNewAccount = localStorage.getItem('isNewAccountSession') === 'true';
  
  // For new accounts, don't use sample data
  if (isNewAccount) {
    console.log("Initializing empty store accounts for new user");
    return getStoredAccounts('storeAccounts', []);
  }
  
  const sampleStores = [
    { id: generateUniqueId("store"), name: "SuperMart Downtown" },
    { id: generateUniqueId("store"), name: "FreshMart Heights" },
    { id: generateUniqueId("store"), name: "Value Grocery West" },
  ];
  
  return getStoredAccounts('storeAccounts', sampleStores);
};

// Initialize maintenance accounts - with empty arrays for new accounts
export const initializeMaintenanceAccounts = (): MaintenanceAccount[] => {
  // Check if this is a new account session
  const isNewAccount = localStorage.getItem('isNewAccountSession') === 'true';
  
  // For new accounts, don't use sample data
  if (isNewAccount) {
    console.log("Initializing empty maintenance accounts for new user");
    return getStoredAccounts('maintenanceAccounts', []);
  }
  
  const sampleMaintenance = [
    { id: generateUniqueId("maint"), name: "Cart Repair Pros" },
    { id: generateUniqueId("maint"), name: "Maintenance Experts" },
    { id: generateUniqueId("maint"), name: "Fix-It Solutions" },
  ];
  
  return getStoredAccounts('maintenanceAccounts', sampleMaintenance);
};

// Create a user account if it doesn't exist yet
export const createUserAccountIfNeeded = (
  storeAccounts: StoreAccount[],
  maintenanceAccounts: MaintenanceAccount[]
): UserAccount => {
  // Check if current user account exists in localStorage
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    // Check if this is a new account session
    const isNewAccount = localStorage.getItem('isNewAccountSession') === 'true';
    
    // For new accounts, create an empty account with no defaults
    if (isNewAccount) {
      const defaultAccount: UserAccount = {
        id: generateUniqueId(isNewAccount ? "new_store" : "store"),
        name: "",
        type: "store"
      };
      
      // Save current user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(defaultAccount));
      
      // Create empty connections array
      localStorage.setItem('storeConnections', JSON.stringify([]));
      
      return defaultAccount;
    }
    
    // For this implementation, we'll make the user a store account by default
    // to show the store manager functionality
    const isMaintenance = false; // Set to false to ensure store manager role
    
    let account;
    if (isMaintenance) {
      // Check if we have any maintenance accounts
      if (maintenanceAccounts.length > 0) {
        account = maintenanceAccounts[Math.floor(Math.random() * maintenanceAccounts.length)];
      } else {
        // Create a new empty maintenance account
        account = { id: generateUniqueId("maint"), name: "" };
      }
      account.type = "maintenance";
    } else {
      // Check if we have any store accounts
      if (storeAccounts.length > 0) {
        account = storeAccounts[Math.floor(Math.random() * storeAccounts.length)];
      } else {
        // Create a new empty store account
        account = { id: generateUniqueId("store"), name: "" };
      }
      account.type = "store";
    }
    
    // Save current user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(account));
    
    // Initialize with empty connections
    const connections = getStoredConnections();
    if (connections.length === 0) {
      localStorage.setItem('storeConnections', JSON.stringify([]));
    }
    
    return account as UserAccount;
  }
  
  return JSON.parse(currentUser) as UserAccount;
};

// Get stored connections
export const getStoredConnections = (): StoreConnection[] => {
  const storedConnections = localStorage.getItem('storeConnections');
  return storedConnections ? JSON.parse(storedConnections) : [];
};
