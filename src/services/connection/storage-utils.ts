
import { StoreAccount, MaintenanceAccount, StoreConnection, UserAccount } from "./types";

// Helper function to generate a unique ID with prefix
export const generateUniqueId = (prefix: string): string => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomPart}`;
};

// Get stored accounts or initialize with samples if none exist
export const getStoredAccounts = <T>(key: string, samples: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with sample data if no stored data exists
  localStorage.setItem(key, JSON.stringify(samples));
  return samples;
};

// Initialize store accounts
export const initializeStoreAccounts = (): StoreAccount[] => {
  const sampleStores = [
    { id: generateUniqueId("store"), name: "SuperMart Downtown" },
    { id: generateUniqueId("store"), name: "FreshMart Heights" },
    { id: generateUniqueId("store"), name: "Value Grocery West" },
  ];
  return getStoredAccounts('storeAccounts', sampleStores);
};

// Initialize maintenance accounts
export const initializeMaintenanceAccounts = (): MaintenanceAccount[] => {
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
    // Determine randomly if user should be store or maintenance (50/50 chance)
    const isMaintenance = Math.random() > 0.5;
    
    let account;
    if (isMaintenance) {
      // Assign a random maintenance account
      account = maintenanceAccounts[Math.floor(Math.random() * maintenanceAccounts.length)];
      account.type = "maintenance";
    } else {
      // Assign a random store account
      account = storeAccounts[Math.floor(Math.random() * storeAccounts.length)];
      account.type = "store";
    }
    
    // Save current user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(account));
    
    return account as UserAccount;
  }
  
  return JSON.parse(currentUser) as UserAccount;
};

// Get stored connections
export const getStoredConnections = (): StoreConnection[] => {
  const storedConnections = localStorage.getItem('storeConnections');
  return storedConnections ? JSON.parse(storedConnections) : [];
};
