import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Users, 
  Building, 
  TrendingUp,
  Loader2
} from "lucide-react";

interface ProviderStoreLink {
  id: string;
  provider_org_id: string;
  store_org_id: string;
  status: string;
  created_at: string;
  store?: { name: string };
  provider?: { name: string };
}

export const ConnectionStatusDisplay = () => {
  const [connections, setConnections] = useState<ProviderStoreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userOrgId, setUserOrgId] = useState<string | null>(null);
  const [userOrgType, setUserOrgType] = useState<'store' | 'provider' | null>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organization membership
      const { data: membership } = await supabase
        .from('org_memberships')
        .select('org_id, role, organizations(id, name, type)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.organizations) {
        const org = membership.organizations as any;
        setUserOrgId(org.id);
        setUserOrgType(org.type === 'provider' ? 'provider' : 'store');
        await loadConnections(org.id, org.type);
      }
    } catch (error) {
      console.error("Error loading user context:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async (orgId: string, orgType: string) => {
    try {
      let query;
      
      if (orgType === 'provider') {
        // For providers: get stores they're connected to
        const { data, error } = await supabase
          .from('provider_store_links')
          .select('id, provider_org_id, store_org_id, status, created_at')
          .eq('provider_org_id', orgId);

        if (error) throw error;

        // Fetch store names separately
        const storeIds = (data || []).map(d => d.store_org_id);
        const { data: stores } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', storeIds);

        const storeMap = new Map((stores || []).map(s => [s.id, s.name]));
        setConnections((data || []).map(link => ({
          ...link,
          store: { name: storeMap.get(link.store_org_id) || 'Unknown Store' }
        })));
      } else {
        // For stores: get providers connected to them
        const { data, error } = await supabase
          .from('provider_store_links')
          .select('id, provider_org_id, store_org_id, status, created_at')
          .eq('store_org_id', orgId);

        if (error) throw error;

        // Fetch provider names separately
        const providerIds = (data || []).map(d => d.provider_org_id);
        const { data: providers } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', providerIds);

        const providerMap = new Map((providers || []).map(p => [p.id, p.name]));
        setConnections((data || []).map(link => ({
          ...link,
          provider: { name: providerMap.get(link.provider_org_id) || 'Unknown Provider' }
        })));
      }
    } catch (error) {
      console.error("Error loading connections:", error);
      setConnections([]);
    }
  };

  const handleRefresh = async () => {
    if (!userOrgId || !userOrgType) return;
    setRefreshing(true);
    await loadConnections(userOrgId, userOrgType);
    setRefreshing(false);
  };

  const getConnectionStats = () => {
    const active = connections.filter(c => c.status === 'active').length;
    const pending = connections.filter(c => c.status === 'pending').length;
    const total = connections.length;

    return { active, pending, total };
  };

  const getStatusColor = () => {
    const { active } = getConnectionStats();
    if (active > 0) return "text-primary";
    return "text-muted-foreground";
  };

  const getStatusIcon = () => {
    const { active } = getConnectionStats();
    if (active > 0) {
      return <Wifi className={`h-5 w-5 ${getStatusColor()}`} />;
    }
    return <WifiOff className={`h-5 w-5 ${getStatusColor()}`} />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading connection status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { active, pending, total } = getConnectionStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            Connection Status
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>

        {total === 0 ? (
          <Alert>
            <Building className="h-4 w-4" />
            <AlertDescription>
              No connections yet. Start by sending connection requests to {userOrgType === 'provider' ? 'stores' : 'maintenance providers'}.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>
                Connected to {active} {userOrgType === 'provider' ? 'store' : 'provider'}{active !== 1 ? 's' : ''}
              </span>
            </div>
            {pending > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{pending} request{pending !== 1 ? 's' : ''} pending</span>
              </div>
            )}
          </div>
        )}

        {active > 0 && (
          <Badge variant="default" className="gap-1">
            <Wifi className="h-3 w-3" />
            Connected & Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
