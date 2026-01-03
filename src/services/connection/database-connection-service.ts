import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "./types";

export const DatabaseConnectionService = {
  // Request a connection between a store and maintenance provider
  async requestConnection(storeOrgId: string, providerOrgId: string): Promise<boolean> {
    try {
      console.log(`Requesting connection between store ${storeOrgId} and provider ${providerOrgId}`);
      
      // Check if connection already exists using provider_store_links
      const { data: existingConnection, error: checkError } = await supabase
        .from('provider_store_links')
        .select('*')
        .eq('store_org_id', storeOrgId)
        .eq('provider_org_id', providerOrgId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing connection:", checkError);
        return false;
      }

      if (existingConnection) {
        console.log(`Connection already exists with status: ${existingConnection.status}`);
        return false;
      }

      // Create new connection
      const { error: insertError } = await supabase
        .from('provider_store_links')
        .insert([{
          store_org_id: storeOrgId,
          provider_org_id: providerOrgId,
          status: 'active'
        }]);

      if (insertError) {
        console.error("Error creating connection:", insertError);
        return false;
      }

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
        .from('provider_store_links')
        .update({ status: 'active' })
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
        .from('provider_store_links')
        .delete()
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
  async getStoreConnections(storeOrgId: string): Promise<StoreConnection[]> {
    try {
      const { data, error } = await supabase
        .from('provider_store_links')
        .select('id, store_org_id, provider_org_id, status, created_at')
        .eq('store_org_id', storeOrgId);

      if (error) {
        console.error("Error fetching store connections:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_org_id,
        maintenanceId: conn.provider_org_id,
        status: conn.status === 'active' ? 'active' : 'pending' as "pending" | "active" | "rejected",
        requestedAt: conn.created_at,
        connectedAt: conn.status === 'active' ? conn.created_at : undefined
      }));
    } catch (error) {
      console.error("Failed to get store connections:", error);
      return [];
    }
  },

  // Get maintenance requests for a specific provider
  async getMaintenanceRequests(providerOrgId: string): Promise<StoreConnection[]> {
    try {
      const { data, error } = await supabase
        .from('provider_store_links')
        .select('id, store_org_id, provider_org_id, status, created_at')
        .eq('provider_org_id', providerOrgId);

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_org_id,
        maintenanceId: conn.provider_org_id,
        status: conn.status === 'active' ? 'active' : 'pending' as "pending" | "active" | "rejected",
        requestedAt: conn.created_at,
        connectedAt: conn.status === 'active' ? conn.created_at : undefined
      }));
    } catch (error) {
      console.error("Failed to get maintenance requests:", error);
      return [];
    }
  },

  // Get available stores
  async getStores() {
    const { data } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('type', 'store');
    return (data || []).map(org => ({ id: org.id, name: org.name }));
  },

  // Get available maintenance providers
  async getMaintenanceProviders() {
    const { data } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('type', 'provider');
    return (data || []).map(org => ({ id: org.id, name: org.name }));
  },

  // Get maintenance provider by user ID
  async getMaintenanceProviderByUserId(userId: string): Promise<{ id: string, name: string } | null> {
    try {
      const { data: membership } = await supabase
        .from('org_memberships')
        .select('org_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (!membership) return null;

      const { data: org } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', membership.org_id)
        .eq('type', 'provider')
        .maybeSingle();

      if (!org) return null;
      return { id: org.id, name: org.name };
    } catch (error) {
      console.error('Error in getMaintenanceProviderByUserId:', error);
      return null;
    }
  },

  // Get maintenance provider by email - stub for compatibility
  async getMaintenanceProviderByEmail(email: string): Promise<{ id: string, name: string } | null> {
    console.log('getMaintenanceProviderByEmail is deprecated, use org-based lookups');
    return null;
  },

  // Request connection by email - stub for compatibility
  async requestConnectionByEmail(storeId: string, maintenanceEmail: string): Promise<{ success: boolean, message: string }> {
    return {
      success: false,
      message: "Email-based connections are deprecated. Use organization IDs."
    };
  },

  // Send connection notification - stub
  async sendConnectionNotification(type: string, storeId: string, providerId: string): Promise<void> {
    console.log('Connection notification:', { type, storeId, providerId });
  }
};
