
import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "@/components/settings/types";

// Helper function to generate a unique ID with prefix
const generateUniqueId = (prefix: string): string => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomPart}`;
};

// Get stored accounts or initialize with samples if none exist
const getStoredAccounts = (key: string, samples: any[]) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with sample data if no stored data exists
  localStorage.setItem(key, JSON.stringify(samples));
  return samples;
};

// Initialize store accounts
const initializeStoreAccounts = () => {
  const sampleStores = [
    { id: generateUniqueId("store"), name: "SuperMart Downtown" },
    { id: generateUniqueId("store"), name: "FreshMart Heights" },
    { id: generateUniqueId("store"), name: "Value Grocery West" },
  ];
  return getStoredAccounts('storeAccounts', sampleStores);
};

// Initialize maintenance accounts
const initializeMaintenanceAccounts = () => {
  const sampleMaintenance = [
    { id: generateUniqueId("maint"), name: "Cart Repair Pros" },
    { id: generateUniqueId("maint"), name: "Maintenance Experts" },
    { id: generateUniqueId("maint"), name: "Fix-It Solutions" },
  ];
  return getStoredAccounts('maintenanceAccounts', sampleMaintenance);
};

// Initialize the accounts
const storeAccounts = initializeStoreAccounts();
const maintenanceAccounts = initializeMaintenanceAccounts();

// Create a user account if it doesn't exist yet
const createUserAccountIfNeeded = () => {
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
    
    return account;
  }
  
  return JSON.parse(currentUser);
};

// Initialize current user
const currentUser = createUserAccountIfNeeded();

export const ConnectionService = {
  // Get current user
  getCurrentUser() {
    return currentUser;
  },
  
  // Get user role (store or maintenance)
  getUserRole() {
    return currentUser.type;
  },
  
  // Get current user ID
  getCurrentUserId() {
    return currentUser.id;
  },
  
  // Check if current user is a maintenance provider
  isMaintenanceUser() {
    return currentUser.type === "maintenance";
  },
  
  // Get all stores
  getStores() {
    return storeAccounts;
  },
  
  // Get all maintenance providers
  getMaintenanceProviders() {
    return maintenanceAccounts;
  },
  
  // Get store by ID
  getStoreById(id: string) {
    return storeAccounts.find(store => store.id === id);
  },
  
  // Get maintenance provider by ID
  getMaintenanceById(id: string) {
    return maintenanceAccounts.find(provider => provider.id === id);
  },

  // Request a connection between a store and maintenance provider
  async requestConnection(storeId: string, maintenanceId: string): Promise<boolean> {
    try {
      // In a real implementation, this would create a record in Supabase
      const connections = this.getStoredConnections();
      
      // Check if connection already exists
      const existingConnection = connections.find(
        conn => conn.storeId === storeId && conn.maintenanceId === maintenanceId
      );
      
      if (existingConnection) {
        return false; // Connection already exists
      }
      
      const newConnection: StoreConnection = {
        id: crypto.randomUUID(),
        storeId,
        maintenanceId,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      
      connections.push(newConnection);
      localStorage.setItem('storeConnections', JSON.stringify(connections));
      
      return true;
    } catch (error) {
      console.error("Failed to request connection:", error);
      return false;
    }
  },
  
  // Accept a connection request
  async acceptConnection(connectionId: string): Promise<boolean> {
    try {
      const connections = this.getStoredConnections();
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: "active", connectedAt: new Date().toISOString() }
          : conn
      );
      
      localStorage.setItem('storeConnections', JSON.stringify(updatedConnections));
      return true;
    } catch (error) {
      console.error("Failed to accept connection:", error);
      return false;
    }
  },
  
  // Reject a connection request
  async rejectConnection(connectionId: string): Promise<boolean> {
    try {
      const connections = this.getStoredConnections();
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: "rejected" }
          : conn
      );
      
      localStorage.setItem('storeConnections', JSON.stringify(updatedConnections));
      return true;
    } catch (error) {
      console.error("Failed to reject connection:", error);
      return false;
    }
  },
  
  // Get all connections for a store
  async getStoreConnections(storeId: string): Promise<StoreConnection[]> {
    const connections = this.getStoredConnections();
    return connections.filter(conn => conn.storeId === storeId);
  },
  
  // Get all connection requests for a maintenance provider
  async getMaintenanceRequests(maintenanceId: string): Promise<StoreConnection[]> {
    const connections = this.getStoredConnections();
    return connections.filter(conn => conn.maintenanceId === maintenanceId);
  },
  
  // Helper to get stored connections
  getStoredConnections(): StoreConnection[] {
    const storedConnections = localStorage.getItem('storeConnections');
    return storedConnections ? JSON.parse(storedConnections) : [];
  }
};
