import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "./types";

export const DatabaseConnectionService = {
  // Request a connection between a store and maintenance provider
  async requestConnection(storeId: string, maintenanceId: string): Promise<boolean> {
    try {
      console.log(`Requesting connection between store ${storeId} and maintenance ${maintenanceId}`);
      
      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from('store_provider_connections')
        .select('*')
        .eq('store_id', storeId)
        .eq('provider_id', maintenanceId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error("Error checking existing connection:", checkError);
        return false;
      }

      if (existingConnection) {
        // If the connection exists but was rejected, allow recreating it
        if (existingConnection.status === "rejected") {
          console.log(`Recreating rejected connection between store ${storeId} and maintenance ${maintenanceId}`);
          const { error: updateError } = await supabase
            .from('store_provider_connections')
            .update({ 
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingConnection.id);

          if (updateError) {
            console.error("Error updating connection status:", updateError);
            return false;
          }
          return true;
        }
        console.log(`Connection already exists between store ${storeId} and maintenance ${maintenanceId} with status: ${existingConnection.status}`);
        return false; // Connection already exists
      }

      // Get current user ID to set as initiated_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      // Create new connection
      const { error: insertError } = await supabase
        .from('store_provider_connections')
        .insert({
          store_id: storeId,
          provider_id: maintenanceId,
          status: 'pending',
          initiated_by: user.id
        });

      if (insertError) {
        console.error("Error creating connection:", insertError);
        return false;
      }

      console.log(`Created new connection between store ${storeId} and maintenance ${maintenanceId}`);
      return true;
    } catch (error) {
      console.error("Failed to request connection:", error);
      return false;
    }
  },

  // Accept a connection request
  async acceptConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('store_provider_connections')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) {
        console.error("Error accepting connection:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to accept connection:", error);
      return false;
    }
  },

  // Reject a connection request
  async rejectConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('store_provider_connections')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) {
        console.error("Error rejecting connection:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to reject connection:", error);
      return false;
    }
  },

  // Get connections for a specific store
  async getStoreConnections(storeId: string): Promise<StoreConnection[]> {
    try {
      const { data, error } = await supabase
        .from('store_provider_connections')
        .select(`
          id,
          store_id,
          provider_id,
          status,
          created_at,
          updated_at,
          maintenance_providers!inner(
            company_name,
            contact_email,
            contact_phone
          )
        `)
        .eq('store_id', storeId);

      if (error) {
        console.error("Error fetching store connections:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_id,
        maintenanceId: conn.provider_id,
        status: conn.status === 'accepted' ? 'active' : conn.status as "pending" | "active" | "rejected",
        requestedAt: conn.created_at,
        connectedAt: conn.status === 'accepted' ? conn.updated_at : undefined
      }));
    } catch (error) {
      console.error("Failed to get store connections:", error);
      return [];
    }
  },

  // Get maintenance requests for a specific provider
  async getMaintenanceRequests(maintenanceId: string): Promise<StoreConnection[]> {
    try {
      // First get the maintenance provider record for this user
      const { data: provider, error: providerError } = await supabase
        .from('maintenance_providers')
        .select('id')
        .eq('user_id', maintenanceId)
        .maybeSingle();

      if (providerError || !provider) {
        console.error("Error fetching maintenance provider:", providerError);
        return [];
      }

      const { data, error } = await supabase
        .from('store_provider_connections')
        .select('*')
        .eq('provider_id', provider.id);

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_id,
        maintenanceId: conn.provider_id,
        status: conn.status === 'accepted' ? 'active' : conn.status as "pending" | "active" | "rejected",
        requestedAt: conn.created_at,
        connectedAt: conn.status === 'accepted' ? conn.updated_at : undefined
      }));
    } catch (error) {
      console.error("Failed to get maintenance requests:", error);
      return [];
    }
  },

  // Get available stores (for maintenance providers to connect to)
  getStores() {
    // For now, return a static list, but this could be fetched from database
    return [
      { id: "store1", name: "Downtown Store" },
      { id: "store2", name: "Mall Location" },
      { id: "store3", name: "Airport Store" }
    ];
  },

  // Get available maintenance providers (for stores to connect to)
  async getMaintenanceProviders() {
    try {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('id, company_name')
        .eq('is_verified', true);

      if (error) {
        console.error("Error fetching maintenance providers:", error);
        return [];
      }

      return (data || []).map(provider => ({
        id: provider.id,
        name: provider.company_name
      }));
    } catch (error) {
      console.error("Failed to get maintenance providers:", error);
      return [];
    }
  }
};