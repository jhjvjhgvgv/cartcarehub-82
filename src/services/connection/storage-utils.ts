
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
    // For this implementation, we'll make the user a store account by default
    // to show the store manager functionality
    const isMaintenance = false; // Set to false to ensure store manager role
    
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
    
    // Initialize store-manager relationship
    if (!isMaintenance) {
      // Create some sample store connections for this store manager
      const connections = getStoredConnections();
      if (connections.length === 0) {
        // Create sample connections between stores and maintenance providers
        const newConnections: StoreConnection[] = [];
        
        // Connect the first store with the first maintenance provider
        if (storeAccounts.length > 0 && maintenanceAccounts.length > 0) {
          newConnections.push({
            id: generateUniqueId("conn"),
            storeId: storeAccounts[0].id,
            maintenanceId: maintenanceAccounts[0].id,
            status: "active",
            requestedAt: new Date().toISOString(),
            connectedAt: new Date().toISOString()
          });
        }
        
        // Connect the second store with the second maintenance provider (if they exist)
        if (storeAccounts.length > 1 && maintenanceAccounts.length > 1) {
          newConnections.push({
            id: generateUniqueId("conn"),
            storeId: storeAccounts[1].id,
            maintenanceId: maintenanceAccounts[1].id,
            status: "pending",
            requestedAt: new Date().toISOString()
          });
        }
        
        // Save connections
        localStorage.setItem('storeConnections', JSON.stringify(newConnections));
      }
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
