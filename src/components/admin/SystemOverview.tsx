import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ShoppingCart, 
  Wrench, 
  AlertTriangle, 
  CheckCircle,
  UserCheck,
  DollarSign,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SystemOverview() {
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      // Fetch system-wide statistics using actual tables
      const [
        cartsResult,
        orgsResult,
        workOrdersResult,
        issuesResult,
        rollupsResult
      ] = await Promise.all([
        supabase.from('carts').select('id, status'),
        supabase.from('organizations').select('id, type, settings'),
        supabase.from('work_orders').select('id, status'),
        supabase.from('issues').select('id, severity, status, actual_cost, est_cost'),
        supabase.from('store_daily_rollups').select('downtime_minutes').limit(30)
      ]);

      const carts = cartsResult.data || [];
      const orgs = orgsResult.data || [];
      const workOrders = workOrdersResult.data || [];
      const issues = issuesResult.data || [];
      const rollups = rollupsResult.data || [];

      // Count providers from organizations
      const providerOrgs = orgs.filter(o => o.type === 'provider');
      const storeOrgs = orgs.filter(o => o.type === 'store');
      const corpOrgs = orgs.filter(o => o.type === 'corporation');

      // Calculate costs from issues
      const totalCost = issues.reduce((sum, i) => sum + (Number(i.actual_cost) || Number(i.est_cost) || 0), 0);
      const totalDowntime = rollups.reduce((sum, r) => sum + (r.downtime_minutes || 0), 0);

      return {
        carts: {
          total: carts.length,
          inService: carts.filter(c => c.status === 'in_service').length,
          outOfService: carts.filter(c => c.status === 'out_of_service').length,
          retired: carts.filter(c => c.status === 'retired').length
        },
        organizations: {
          total: orgs.length,
          stores: storeOrgs.length,
          providers: providerOrgs.length,
          corporations: corpOrgs.length,
          verifiedProviders: providerOrgs.filter(p => (p.settings as any)?.is_verified === true).length
        },
        workOrders: {
          total: workOrders.length,
          new: workOrders.filter(w => w.status === 'new').length,
          scheduled: workOrders.filter(w => w.status === 'scheduled').length,
          inProgress: workOrders.filter(w => w.status === 'in_progress').length,
          completed: workOrders.filter(w => w.status === 'completed').length
        },
        issues: {
          total: issues.length,
          open: issues.filter(i => i.status === 'open').length,
          highSeverity: issues.filter(i => i.severity === 'high' || i.severity === 'critical').length
        },
        analytics: {
          totalCost,
          totalDowntime,
          totalIssues: issues.length
        }
      };
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading system overview...</div>;
  }

  const stats = systemStats || {
    carts: { total: 0, inService: 0, outOfService: 0, retired: 0 },
    organizations: { total: 0, stores: 0, providers: 0, corporations: 0, verifiedProviders: 0 },
    workOrders: { total: 0, new: 0, scheduled: 0, inProgress: 0, completed: 0 },
    issues: { total: 0, open: 0, highSeverity: 0 },
    analytics: { totalCost: 0, totalDowntime: 0, totalIssues: 0 }
  };

  const systemHealth = () => {
    const inServicePercentage = stats.carts.total > 0 ? (stats.carts.inService / stats.carts.total) * 100 : 100;
    const completedPercentage = stats.workOrders.total > 0 ? (stats.workOrders.completed / stats.workOrders.total) * 100 : 100;
    const lowIssuePercentage = stats.issues.total > 0 ? ((stats.issues.total - stats.issues.highSeverity) / stats.issues.total) * 100 : 100;
    
    return Math.round((inServicePercentage + completedPercentage + lowIssuePercentage) / 3);
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            System Health Score
          </CardTitle>
          <CardDescription>
            Overall system performance and reliability metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={systemHealth()} className="h-3" />
            </div>
            <Badge variant={systemHealth() > 75 ? "default" : systemHealth() > 50 ? "secondary" : "destructive"}>
              {systemHealth()}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on in-service carts, completed work orders, and issue severity
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organizations.total}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">{stats.organizations.stores} Stores</Badge>
              <Badge variant="outline">{stats.organizations.providers} Providers</Badge>
              <Badge variant="outline">{stats.organizations.corporations} Corps</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carts.total}</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant="default" className="text-xs">{stats.carts.inService} In Service</Badge>
              <Badge variant="secondary" className="text-xs">{stats.carts.outOfService} Out of Service</Badge>
              <Badge variant="destructive" className="text-xs">{stats.carts.retired} Retired</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workOrders.total}</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{stats.workOrders.new + stats.workOrders.scheduled} Pending</Badge>
              <Badge variant="default" className="text-xs">{stats.workOrders.inProgress} In Progress</Badge>
              <Badge variant="outline" className="text-xs">{stats.workOrders.completed} Done</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organizations.providers}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">{stats.organizations.verifiedProviders} Verified</Badge>
              <Badge variant="secondary">{stats.organizations.providers - stats.organizations.verifiedProviders} Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial & Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maintenance Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.analytics.totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all maintenance activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analytics.totalDowntime.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Minutes of cart downtime (30d)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analytics.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.issues.open} open, {stats.issues.highSeverity} high severity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Status */}
      {stats.issues.highSeverity > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are {stats.issues.highSeverity} high-severity issues requiring attention.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
