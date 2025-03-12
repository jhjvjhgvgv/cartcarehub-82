
import { StoreConnection } from "./types";
import { getStoredConnections } from "./storage-utils";
import { UserService } from "./user-service";

export const ConnectionService = {
  // Request a connection between a store and maintenance provider
  async requestConnection(storeId: string, maintenanceId: string): Promise<boolean> {
    try {
      // In a real implementation, this would create a record in Supabase
      const connections = getStoredConnections();
      
      // Check if connection already exists
      const existingConnection = connections.find(
        conn => conn.storeId === storeId && conn.maintenanceId === maintenanceId
      );
      
      if (existingConnection) {
        // If the connection exists but was rejected, allow recreating it
        if (existingConnection.status === "rejected") {
          existingConnection.status = "pending";
          existingConnection.requestedAt = new Date().toISOString();
          localStorage.setItem('storeConnections', JSON.stringify(connections));
          return true;
        }
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
      const connections = getStoredConnections();
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
      const connections = getStoredConnections();
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
    const connections = getStoredConnections();
    return connections.filter(conn => conn.storeId === storeId);
  },
  
  // Get all connection requests for a maintenance provider
  async getMaintenanceRequests(maintenanceId: string): Promise<StoreConnection[]> {
    const connections = getStoredConnections();
    return connections.filter(conn => conn.maintenanceId === maintenanceId);
  },
  
  // Helper to get stored connections
  getStoredConnections
};
