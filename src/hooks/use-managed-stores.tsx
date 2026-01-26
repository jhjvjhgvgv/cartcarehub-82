import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ManagedStore {
  id: string;
  name: string;
  status?: string;
}

export function useManagedStores() {
  return useQuery({
    queryKey: ["managed-stores"],
    queryFn: async (): Promise<ManagedStore[]> => {
      // Get the current user's accessible stores via the portal context RPC
      const { data: context, error: contextError } = await supabase.rpc('get_my_portal_context');
      
      if (contextError) {
        console.error("Error fetching portal context:", contextError);
        // Fallback: try to get all stores the user is a member of
        const { data: memberships } = await supabase
          .from('org_memberships')
          .select('org_id, organizations(id, name, type)')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
        
        if (memberships) {
          return memberships
            .filter((m: any) => m.organizations?.type === 'store')
            .map((m: any) => ({
              id: m.organizations.id,
              name: m.organizations.name,
              status: 'active'
            }));
        }
        return [];
      }

      // Extract accessible stores from context - cast from Json type
      const contextObj = context as { accessible_stores?: Array<{ id: string; name: string }> } | null;
      const accessibleStores = contextObj?.accessible_stores || [];
      return accessibleStores.map((store) => ({
        id: store.id,
        name: store.name,
        status: 'active'
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
