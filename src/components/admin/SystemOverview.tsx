import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ShoppingCart, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  UserCheck,
  Building,
  DollarSign,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SystemOverview() {
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      // Fetch system-wide statistics
      const [
        cartsResult,
        usersResult,
        providersResult,
        requestsResult,
        analyticsResult
      ] = await Promise.all([
        supabase.from('carts').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('maintenance_providers').select('*'),
        supabase.from('maintenance_requests').select('*'),
        supabase.from('cart_analytics').select('*')
      ]);

      const carts = cartsResult.data || [];
      const users = usersResult.data || [];
      const providers = providersResult.data || [];
      const requests = requestsResult.data || [];
      const analytics = analyticsResult.data || [];

      return {
        carts: {
          total: carts.length,
          active: carts.filter(c => c.status === 'active').length,
          maintenance: carts.filter(c => c.status === 'maintenance').length,
          retired: carts.filter(c => c.status === 'retired').length
        },
        users: {
          total: users.length,
          store: users.filter(u => u.role === 'store').length,
          maintenance: users.filter(u => u.role === 'maintenance').length,
          active: users.filter(u => u.is_active).length
        },
        providers: {
          total: providers.length,
          verified: providers.filter(p => p.is_verified).length,
          pending: providers.filter(p => !p.is_verified).length
        },
        requests: {
          total: requests.length,
          pending: requests.filter(r => r.status === 'pending').length,
          inProgress: requests.filter(r => r.status === 'in_progress').length,
          completed: requests.filter(r => r.status === 'completed').length,
          urgent: requests.filter(r => r.priority === 'urgent').length
        },
        analytics: {
          totalCost: analytics.reduce((sum, a) => sum + (Number(a.maintenance_cost) || 0), 0),
          totalDowntime: analytics.reduce((sum, a) => sum + (a.downtime_minutes || 0), 0),
          totalIssues: analytics.reduce((sum, a) => sum + (a.issues_reported || 0), 0)
        }
      };
    }
  });

  if (isLoading) {
    return <div>Loading system overview...</div>;
  }

  const stats = systemStats || {
    carts: { total: 0, active: 0, maintenance: 0, retired: 0 },
    users: { total: 0, store: 0, maintenance: 0, active: 0 },
    providers: { total: 0, verified: 0, pending: 0 },
    requests: { total: 0, pending: 0, inProgress: 0, completed: 0, urgent: 0 },
    analytics: { totalCost: 0, totalDowntime: 0, totalIssues: 0 }
  };

  const systemHealth = () => {
    const activeCartPercentage = stats.carts.total > 0 ? (stats.carts.active / stats.carts.total) * 100 : 0;
    const completedRequestPercentage = stats.requests.total > 0 ? (stats.requests.completed / stats.requests.total) * 100 : 0;
    const verifiedProviderPercentage = stats.providers.total > 0 ? (stats.providers.verified / stats.providers.total) * 100 : 0;
    
    return Math.round((activeCartPercentage + completedRequestPercentage + verifiedProviderPercentage) / 3);
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
            Based on active carts, completed requests, and verified providers
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{stats.users.store} Store</Badge>
              <Badge variant="outline">{stats.users.maintenance} Maintenance</Badge>
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
              <Badge variant="default" className="text-xs">{stats.carts.active} Active</Badge>
              <Badge variant="secondary" className="text-xs">{stats.carts.maintenance} Maintenance</Badge>
              <Badge variant="destructive" className="text-xs">{stats.carts.retired} Retired</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requests.total}</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{stats.requests.pending} Pending</Badge>
              <Badge variant="default" className="text-xs">{stats.requests.inProgress} In Progress</Badge>
              <Badge variant="outline" className="text-xs">{stats.requests.completed} Done</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.providers.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">{stats.providers.verified} Verified</Badge>
              <Badge variant="secondary">{stats.providers.pending} Pending</Badge>
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
              Minutes of cart downtime
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
              Total issues across all carts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Status */}
      {stats.requests.urgent > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are {stats.requests.urgent} urgent maintenance requests requiring immediate attention.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}