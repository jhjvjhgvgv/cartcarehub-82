import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MembershipRole =
  | "corp_admin"
  | "corp_viewer"
  | "store_admin"
  | "store_viewer"
  | "provider_admin"
  | "provider_tech";

export type OrgType = "corporation" | "store" | "provider";

export interface MembershipSummary {
  membership_id: string;
  org_id: string;
  org_name: string;
  org_type: OrgType;
  role: MembershipRole;
}

export interface AdminUserRow {
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  memberships: MembershipSummary[];
}

export interface OrgRow {
  id: string;
  name: string;
  type: OrgType;
  parent_org_id: string | null;
  market: string | null;
  region: string | null;
  created_at: string;
}

export function useCorpAdminCheck() {
  return useQuery({
    queryKey: ["is-corp-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_corp_admin");
      if (error) throw error;
      return Boolean(data);
    },
  });
}

export function useCorpAdminCount() {
  return useQuery({
    queryKey: ["corp-admin-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("org_memberships")
        .select("*", { count: "exact", head: true })
        .eq("role", "corp_admin");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useAdminUsersWithMemberships(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-users-memberships"],
    enabled,
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data, error } = await supabase.rpc(
        "admin_list_users_with_memberships"
      );
      if (error) throw error;
      return (data ?? []) as unknown as AdminUserRow[];
    },
  });
}

export function useOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: ["organizations-all"],
    enabled,
    queryFn: async (): Promise<OrgRow[]> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id,name,type,parent_org_id,market,region,created_at")
        .order("name");
      if (error) throw error;
      return (data ?? []) as OrgRow[];
    },
  });
}

export function useBootstrapCorpAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orgName: string) => {
      const { data, error } = await supabase.rpc("bootstrap_first_corp_admin", {
        p_org_name: orgName,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Corp admin granted", description: "You are now a corp_admin." });
      qc.invalidateQueries({ queryKey: ["is-corp-admin"] });
      qc.invalidateQueries({ queryKey: ["corp-admin-count"] });
      qc.invalidateQueries({ queryKey: ["organizations-all"] });
      qc.invalidateQueries({ queryKey: ["admin-users-memberships"] });
    },
    onError: (e: any) =>
      toast({ title: "Bootstrap failed", description: e.message, variant: "destructive" }),
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      type: OrgType;
      parent_org_id?: string | null;
      market?: string | null;
      region?: string | null;
    }) => {
      const { data, error } = await supabase.rpc("admin_create_organization", {
        p_name: input.name,
        p_type: input.type,
        p_parent_org_id: input.parent_org_id ?? null,
        p_market: input.market ?? null,
        p_region: input.region ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Organization created" });
      qc.invalidateQueries({ queryKey: ["organizations-all"] });
    },
    onError: (e: any) =>
      toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useAssignMembership() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      org_id: string;
      role: MembershipRole;
    }) => {
      const { data, error } = await supabase.rpc("admin_assign_membership", {
        p_user_id: input.user_id,
        p_org_id: input.org_id,
        p_role: input.role,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Membership assigned" });
      qc.invalidateQueries({ queryKey: ["admin-users-memberships"] });
    },
    onError: (e: any) =>
      toast({ title: "Assign failed", description: e.message, variant: "destructive" }),
  });
}

export function useRemoveMembership() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (membership_id: string) => {
      const { error } = await supabase.rpc("admin_remove_membership", {
        p_membership_id: membership_id,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({ title: "Membership removed" });
      qc.invalidateQueries({ queryKey: ["admin-users-memberships"] });
    },
    onError: (e: any) =>
      toast({ title: "Remove failed", description: e.message, variant: "destructive" }),
  });
}

export const MEMBERSHIP_ROLES: MembershipRole[] = [
  "corp_admin",
  "corp_viewer",
  "store_admin",
  "store_viewer",
  "provider_admin",
  "provider_tech",
];

export const ORG_TYPES: OrgType[] = ["corporation", "store", "provider"];
