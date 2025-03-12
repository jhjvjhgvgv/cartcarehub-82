import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "@/components/settings/types";

// This would typically interact with Supabase directly
// For now, we'll simulate it with local storage
export const ConnectionService = {
  // Request a connection between a store and maintenance provider
  async requestConnection(storeId: string, maintenanceEmail: string): Promise<boolean> {
    try {
      // In a real implementation, this would create a record in Supabase
      const connections = this.getStoredConnections();
      
      const newConnection: StoreConnection = {
        id: crypto.randomUUID(),
        storeId,
        maintenanceId: maintenanceEmail, // Using email as ID for simplicity
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
  
  // Create a test connection for demonstration purposes
  async createTestConnection(): Promise<boolean> {
    try {
      const connections = this.getStoredConnections();
      
      const testStoreId = "test-store-" + Date.now();
      const testMaintenanceId = "test-maintenance-" + Date.now();
      
      const newConnection: StoreConnection = {
        id: crypto.randomUUID(),
        storeId: testStoreId,
        maintenanceId: testMaintenanceId,
        status: "active",
        requestedAt: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
      };
      
      connections.push(newConnection);
      localStorage.setItem('storeConnections', JSON.stringify(connections));
      
      return true;
    } catch (error) {
      console.error("Failed to create test connection:", error);
      return false;
    }
  },
  
  // Helper to get stored connections
  getStoredConnections(): StoreConnection[] {
    const storedConnections = localStorage.getItem('storeConnections');
    return storedConnections ? JSON.parse(storedConnections) : [];
  }
};
