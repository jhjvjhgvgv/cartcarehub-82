import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type MembershipRole = 
  | 'corp_admin' 
  | 'corp_viewer' 
  | 'store_admin' 
  | 'store_viewer' 
  | 'provider_admin' 
  | 'provider_tech';

export type OrgType = 'corporation' | 'store' | 'provider';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  parent_org_id: string | null;
  market: string | null;
  region: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
  organization: Organization;
}

interface OrgContextType {
  memberships: OrgMembership[];
  activeOrgId: string | null;
  activeOrg: Organization | null;
  activeMembership: OrgMembership | null;
  isLoading: boolean;
  error: string | null;
  setActiveOrgId: (orgId: string) => void;
  refreshMemberships: () => Promise<void>;
  hasNoMemberships: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const ACTIVE_ORG_KEY = 'activeOrgId';

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_ORG_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    if (!user) {
      setMemberships([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('org_memberships')
        .select(`
          id,
          org_id,
          user_id,
          role,
          created_at,
          organization:organizations (
            id,
            name,
            type,
            parent_org_id,
            market,
            region,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching memberships:', fetchError);
        setError(fetchError.message);
        setMemberships([]);
        return;
      }

      // Transform the data to match our interface
      const transformedMemberships: OrgMembership[] = (data || [])
        .filter(m => m.organization) // Filter out any without org data
        .map(m => ({
          id: m.id,
          org_id: m.org_id,
          user_id: m.user_id,
          role: m.role as MembershipRole,
          created_at: m.created_at,
          organization: m.organization as unknown as Organization
        }));

      setMemberships(transformedMemberships);

      // Auto-select first org if none selected
      if (!activeOrgId && transformedMemberships.length > 0) {
        const firstOrgId = transformedMemberships[0].org_id;
        setActiveOrgIdState(firstOrgId);
        localStorage.setItem(ACTIVE_ORG_KEY, firstOrgId);
      }
    } catch (err) {
      console.error('Error in fetchMemberships:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, activeOrgId]);

  useEffect(() => {
    if (!authLoading) {
      fetchMemberships();
    }
  }, [authLoading, fetchMemberships]);

  const setActiveOrgId = useCallback((orgId: string) => {
    setActiveOrgIdState(orgId);
    localStorage.setItem(ACTIVE_ORG_KEY, orgId);
  }, []);

  const activeOrg = memberships.find(m => m.org_id === activeOrgId)?.organization || null;
  const activeMembership = memberships.find(m => m.org_id === activeOrgId) || null;
  const hasNoMemberships = !isLoading && !authLoading && memberships.length === 0 && !!user;

  return (
    <OrgContext.Provider
      value={{
        memberships,
        activeOrgId,
        activeOrg,
        activeMembership,
        isLoading: isLoading || authLoading,
        error,
        setActiveOrgId,
        refreshMemberships: fetchMemberships,
        hasNoMemberships,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};

// Helper to get the dashboard path for a role
export const getDashboardPath = (role: MembershipRole): string => {
  if (role === 'corp_admin' || role === 'corp_viewer') {
    return '/corp/dashboard';
  }
  if (role === 'provider_admin' || role === 'provider_tech') {
    return '/provider/dashboard';
  }
  return '/store/dashboard';
};

// Helper to check if role is store-related
export const isStoreRole = (role: MembershipRole): boolean => {
  return role === 'store_admin' || role === 'store_viewer';
};

export const isCorpRole = (role: MembershipRole): boolean => {
  return role === 'corp_admin' || role === 'corp_viewer';
};

export const isProviderRole = (role: MembershipRole): boolean => {
  return role === 'provider_admin' || role === 'provider_tech';
};
