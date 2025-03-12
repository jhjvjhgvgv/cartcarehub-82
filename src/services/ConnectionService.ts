
import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "@/components/settings/types";

// Sample data for stores and maintenance providers
// In a real implementation, this would come from Supabase
const storeAccounts = [
  { id: "store_123", name: "SuperMart Downtown" },
  { id: "store_456", name: "FreshMart Heights" },
  { id: "store_789", name: "Value Grocery West" },
];

const maintenanceAccounts = [
  { id: "maint_123", name: "Cart Repair Pros" },
  { id: "maint_456", name: "Maintenance Experts" },
  { id: "maint_789", name: "Fix-It Solutions" },
];

export const ConnectionService = {
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
