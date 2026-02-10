import { supabase } from "@/integrations/supabase/client";
import { StoreConnection } from "./types";

export const DatabaseConnectionService = {
  // Request a connection between a store and maintenance provider (starts as pending)
  async requestConnection(storeOrgId: string, providerOrgId: string): Promise<boolean> {
    try {
      console.log(`Requesting connection between store ${storeOrgId} and provider ${providerOrgId}`);
      
      // Check if connection already exists
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

      // Create new connection as pending
      const { error: insertError } = await supabase
        .from('provider_store_links')
        .insert([{
          store_org_id: storeOrgId,
          provider_org_id: providerOrgId,
          status: 'pending'
        }]);

      if (insertError) {
        console.error("Error creating connection:", insertError);
        return false;
      }

      // Send notification
      await this.sendConnectionNotification('request', storeOrgId, providerOrgId);

      return true;
    } catch (error) {
      console.error("Failed to request connection:", error);
      return false;
    }
  },

  // Accept a connection request
  async acceptConnection(connectionId: string): Promise<boolean> {
    try {
      const { data: link, error: fetchError } = await supabase
        .from('provider_store_links')
        .select('store_org_id, provider_org_id')
        .eq('id', connectionId)
        .maybeSingle();

      const { error } = await supabase
        .from('provider_store_links')
        .update({ status: 'active' })
        .eq('id', connectionId);

      if (error) {
        console.error("Error accepting connection:", error);
        return false;
      }

      if (link) {
        await this.sendConnectionNotification('accepted', link.store_org_id, link.provider_org_id);
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
      const { data: link } = await supabase
        .from('provider_store_links')
        .select('store_org_id, provider_org_id')
        .eq('id', connectionId)
        .maybeSingle();

      const { error } = await supabase
        .from('provider_store_links')
        .delete()
        .eq('id', connectionId);

      if (error) {
        console.error("Error rejecting connection:", error);
        return false;
      }

      if (link) {
        await this.sendConnectionNotification('rejected', link.store_org_id, link.provider_org_id);
      }

      return true;
    } catch (error) {
      console.error("Failed to reject connection:", error);
      return false;
    }
  },

  // Get connections for a specific store org
  async getStoreConnections(storeOrgId: string): Promise<StoreConnection[]> {
    try {
      const { data, error } = await supabase
        .from('provider_store_links')
        .select(`
          id, store_org_id, provider_org_id, status, created_at,
          provider:organizations!provider_store_links_provider_org_id_fkey(id, name)
        `)
        .eq('store_org_id', storeOrgId);

      if (error) {
        console.error("Error fetching store connections:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_org_id,
        maintenanceId: conn.provider_org_id,
        providerName: (conn.provider as any)?.name,
        status: conn.status === 'active' ? 'active' : 'pending' as "pending" | "active" | "rejected",
        requestedAt: conn.created_at,
        connectedAt: conn.status === 'active' ? conn.created_at : undefined
      }));
    } catch (error) {
      console.error("Failed to get store connections:", error);
      return [];
    }
  },

  // Get maintenance requests for a specific provider org
  async getMaintenanceRequests(providerOrgId: string): Promise<StoreConnection[]> {
    try {
      const { data, error } = await supabase
        .from('provider_store_links')
        .select(`
          id, store_org_id, provider_org_id, status, created_at,
          store:organizations!provider_store_links_store_org_id_fkey(id, name)
        `)
        .eq('provider_org_id', providerOrgId);

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        storeId: conn.store_org_id,
        storeName: (conn.store as any)?.name,
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

  // Get store by ID
  async getStoreById(id: string): Promise<{ id: string, name: string } | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', id)
        .eq('type', 'store')
        .maybeSingle();

      if (error || !data) return null;
      return { id: data.id, name: data.name };
    } catch (error) {
      console.error('Error in getStoreById:', error);
      return null;
    }
  },

  // Get maintenance provider by ID
  async getMaintenanceById(id: string): Promise<{ id: string, name: string } | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', id)
        .eq('type', 'provider')
        .maybeSingle();

      if (error || !data) return null;
      return { id: data.id, name: data.name };
    } catch (error) {
      console.error('Error in getMaintenanceById:', error);
      return null;
    }
  },

  // Get current user ID from Supabase auth
  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
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

  // Send connection notification via edge function
  async sendConnectionNotification(type: string, storeOrgId: string, providerOrgId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('connection-notification', {
        body: { type, storeOrgId, providerOrgId }
      });
      if (error) {
        console.warn('Connection notification failed (non-fatal):', error);
      }
    } catch (err) {
      console.warn('Connection notification error (non-fatal):', err);
    }
  }
};
