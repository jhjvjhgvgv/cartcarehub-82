
import { StoreConnection } from "./types";
import { getStoredConnections } from "./storage-utils";
import { UserService } from "./user-service";

export const ConnectionService = {
  // Request a connection between a store and maintenance provider
  async requestConnection(storeId: string, maintenanceId: string): Promise<boolean> {
    try {
      console.log(`Requesting connection between store ${storeId} and maintenance ${maintenanceId}`);
      // In a real implementation, this would create a record in Supabase
      const connections = getStoredConnections();
      
      // Check if connection already exists
      const existingConnection = connections.find(
        conn => conn.storeId === storeId && conn.maintenanceId === maintenanceId
      );
      
      if (existingConnection) {
        // If the connection exists but was rejected, allow recreating it
        if (existingConnection.status === "rejected") {
          console.log(`Recreating rejected connection between store ${storeId} and maintenance ${maintenanceId}`);
          existingConnection.status = "pending";
          existingConnection.requestedAt = new Date().toISOString();
          localStorage.setItem('storeConnections', JSON.stringify(connections));
          return true;
        }
        console.log(`Connection already exists between store ${storeId} and maintenance ${maintenanceId} with status: ${existingConnection.status}`);
        return false; // Connection already exists
      }
      
      const newConnection: StoreConnection = {
        id: crypto.randomUUID(),
        storeId,
        maintenanceId,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      
      console.log(`Creating new connection with ID: ${newConnection.id}`);
      connections.push(newConnection);
      localStorage.setItem('storeConnections', JSON.stringify(connections));
      
      return true;
    } catch (error) {
      console.error("Failed to request connection:", error);
      // Provide more detailed error information
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return false;
    }
  },
  
  // Accept a connection request
  async acceptConnection(connectionId: string): Promise<boolean> {
    try {
      console.log(`Accepting connection with ID: ${connectionId}`);
      const connections = getStoredConnections();
      
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection) {
        console.error(`Connection with ID ${connectionId} not found`);
        return false;
      }
      
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: "active", connectedAt: new Date().toISOString() }
          : conn
      );
      
      localStorage.setItem('storeConnections', JSON.stringify(updatedConnections));
      console.log(`Connection ${connectionId} status updated to active`);
      return true;
    } catch (error) {
      console.error("Failed to accept connection:", error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return false;
    }
  },
  
  // Reject a connection request
  async rejectConnection(connectionId: string): Promise<boolean> {
    try {
      console.log(`Rejecting connection with ID: ${connectionId}`);
      const connections = getStoredConnections();
      
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection) {
        console.error(`Connection with ID ${connectionId} not found`);
        return false;
      }
      
      const updatedConnections = connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: "rejected" }
          : conn
      );
      
      localStorage.setItem('storeConnections', JSON.stringify(updatedConnections));
      console.log(`Connection ${connectionId} status updated to rejected`);
      return true;
    } catch (error) {
      console.error("Failed to reject connection:", error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return false;
    }
  },
  
  // Get all connections for a store
  async getStoreConnections(storeId: string): Promise<StoreConnection[]> {
    try {
      console.log(`Fetching connections for store: ${storeId}`);
      const connections = getStoredConnections();
      const storeConnections = connections.filter(conn => conn.storeId === storeId);
      console.log(`Found ${storeConnections.length} connections for store ${storeId}`);
      return storeConnections;
    } catch (error) {
      console.error(`Failed to get store connections for store ${storeId}:`, error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return [];
    }
  },
  
  // Get all connection requests for a maintenance provider
  async getMaintenanceRequests(maintenanceId: string): Promise<StoreConnection[]> {
    try {
      console.log(`Fetching connection requests for maintenance provider: ${maintenanceId}`);
      const connections = getStoredConnections();
      const maintenanceRequests = connections.filter(conn => conn.maintenanceId === maintenanceId);
      console.log(`Found ${maintenanceRequests.length} requests for maintenance provider ${maintenanceId}`);
      return maintenanceRequests;
    } catch (error) {
      console.error(`Failed to get maintenance requests for provider ${maintenanceId}:`, error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return [];
    }
  },
  
  // Helper to get stored connections
  getStoredConnections
};
