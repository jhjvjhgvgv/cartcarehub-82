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
      
      // Send notification email (non-blocking)
      this.sendConnectionNotification('request', storeId, maintenanceId).catch(error => {
        console.error("Failed to send connection notification:", error);
      });
      
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

      // Send notification email (non-blocking)
      this.sendConnectionNotification('accepted', '', connectionId).catch(error => {
        console.error("Failed to send acceptance notification:", error);
      });

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
  },

  // New function to look up maintenance provider UUID by email
  async getMaintenanceProviderByEmail(email: string): Promise<{ id: string, name: string } | null> {
    try {
      console.log('DatabaseConnectionService: Searching for maintenance provider by email', email);
      
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('id, company_name, contact_email, is_verified')
        .eq('contact_email', email.trim().toLowerCase())
        .eq('is_verified', true)
        .maybeSingle();

      if (error) {
        console.error('DatabaseConnectionService: Error fetching verified provider by email:', error);
        // If no verified records found, try searching without verification requirement
        const { data: unverifiedData, error: unverifiedError } = await supabase
          .from('maintenance_providers')
          .select('id, company_name, contact_email, is_verified')
          .eq('contact_email', email.trim().toLowerCase())
          .maybeSingle();
        
        if (unverifiedError) {
          console.error('DatabaseConnectionService: No maintenance provider found with email:', email);
          return null;
        }
        
        console.log('DatabaseConnectionService: Found unverified provider', unverifiedData);
        return unverifiedData ? {
          id: unverifiedData.id,
          name: unverifiedData.company_name
        } : null;
      }

      console.log('DatabaseConnectionService: Found verified provider', data);
      if (!data) {
        console.log('DatabaseConnectionService: No provider found with email:', email);
        return null;
      }

      return {
        id: data.id,
        name: data.company_name
      };
    } catch (error) {
      console.error('DatabaseConnectionService: Error in getMaintenanceProviderByEmail:', error);
      return null;
    }
  },

  // Enhanced connection request with email lookup support
  async requestConnectionByEmail(storeId: string, maintenanceEmail: string): Promise<{ success: boolean, message: string }> {
    try {
      console.log('DatabaseConnectionService: Requesting connection by email', { storeId, maintenanceEmail });
      
      // First, look up the maintenance provider by email
      const provider = await this.getMaintenanceProviderByEmail(maintenanceEmail);
      console.log('DatabaseConnectionService: Found provider', provider);
      
      if (!provider) {
        return {
          success: false,
          message: "No verified maintenance provider found with this email address."
        };
      }

      // Use the existing requestConnection method with the found provider ID
      const success = await this.requestConnection(storeId, provider.id);
      console.log('DatabaseConnectionService: Connection request result', success);
      
      if (success) {
        return {
          success: true,
          message: `Connection request sent to ${provider.name}.`
        };
      } else {
        return {
          success: false,
          message: "Failed to create connection request. A connection may already exist."
        };
      }
    } catch (error) {
      console.error('DatabaseConnectionService: Error in requestConnectionByEmail:', error);
      return {
        success: false,
        message: "An unexpected error occurred while processing the connection request."
      };
    }
  },

  // Send connection notification email
  async sendConnectionNotification(type: 'request' | 'accepted' | 'rejected', storeId: string, providerIdOrConnectionId: string): Promise<void> {
    try {
      let providerData = null;
      
      if (type === 'request') {
        // For requests, providerIdOrConnectionId is the provider ID
        const { data } = await supabase
          .from('maintenance_providers')
          .select('contact_email, company_name')
          .eq('id', providerIdOrConnectionId)
          .maybeSingle();
        providerData = data;
      } else {
        // For accepted/rejected, providerIdOrConnectionId is the connection ID
        const { data } = await supabase
          .from('store_provider_connections')
          .select(`
            store_id,
            maintenance_providers!inner(
              contact_email,
              company_name
            )
          `)
          .eq('id', providerIdOrConnectionId)
          .maybeSingle();
        
        if (data) {
          providerData = {
            contact_email: (data as any).maintenance_providers.contact_email,
            company_name: (data as any).maintenance_providers.company_name
          };
          storeId = (data as any).store_id;
        }
      }

      if (!providerData) {
        console.error("Could not find provider data for notification");
        return;
      }

      // Call the edge function to send the email
      const { error } = await supabase.functions.invoke('connection-notification', {
        body: {
          type,
          storeId,
          providerId: providerIdOrConnectionId,
          providerEmail: providerData.contact_email,
          providerName: providerData.company_name,
          storeName: storeId // In a real app, this would be fetched from a stores table
        }
      });

      if (error) {
        console.error("Error sending connection notification:", error);
      }
    } catch (error) {
      console.error("Failed to send connection notification:", error);
    }
  }
};