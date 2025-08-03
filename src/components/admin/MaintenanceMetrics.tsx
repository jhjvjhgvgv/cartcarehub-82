import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";
import { useMaintenanceRequests, useOverdueMaintenance, useUpcomingMaintenance } from "@/hooks/use-maintenance";

export function MaintenanceMetrics() {
  const { data: allRequests, isLoading: requestsLoading } = useMaintenanceRequests();
  const { data: overdueItems, isLoading: overdueLoading } = useOverdueMaintenance();
  const { data: upcomingItems, isLoading: upcomingLoading } = useUpcomingMaintenance(30);

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-maintenance-metrics'],
    queryFn: async () => {
      // Get detailed maintenance performance metrics
      const { data: requests, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          maintenance_providers!maintenance_requests_provider_id_fkey(company_name)
        `);

      if (requestError) throw requestError;

      const { data: analytics, error: analyticsError } = await supabase
        .from('cart_analytics')
        .select('*');

      if (analyticsError) throw analyticsError;

      // Calculate performance metrics
      const totalCost = analytics.reduce((sum, a) => sum + (Number(a.maintenance_cost) || 0), 0);
      const totalDowntime = analytics.reduce((sum, a) => sum + (a.downtime_minutes || 0), 0);
      const totalIssues = analytics.reduce((sum, a) => sum + (a.issues_reported || 0), 0);

      // Provider performance
      const providerStats = requests.reduce((acc, req) => {
        const providerId = req.provider_id;
        if (!acc[providerId]) {
          acc[providerId] = {
            company_name: req.maintenance_providers?.company_name || 'Unknown',
            total: 0,
            completed: 0,
            avgCost: 0,
            avgDuration: 0,
            totalCost: 0,
            totalDuration: 0
          };
        }
        
        acc[providerId].total++;
        
        if (req.status === 'completed') {
          acc[providerId].completed++;
          if (req.cost) acc[providerId].totalCost += Number(req.cost);
          if (req.actual_duration) acc[providerId].totalDuration += req.actual_duration;
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate averages
      Object.keys(providerStats).forEach(providerId => {
        const stats = providerStats[providerId];
        if (stats.completed > 0) {
          stats.avgCost = stats.totalCost / stats.completed;
          stats.avgDuration = stats.totalDuration / stats.completed;
        }
      });

      return {
        totalCost,
        totalDowntime,
        totalIssues,
        requests: requests || [],
        providerStats: Object.entries(providerStats).map(([id, stats]) => ({
          id,
          ...stats
        }))
      };
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary">High</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (requestsLoading || metricsLoading) {
    return <div>Loading maintenance metrics...</div>;
  }

  const completedRequests = allRequests?.filter(r => r.status === 'completed') || [];
  const avgCompletionTime = completedRequests.length > 0 
    ? completedRequests.reduce((sum, r) => sum + (r.actual_duration || 0), 0) / completedRequests.length 
    : 0;

  const completionRate = allRequests && allRequests.length > 0 
    ? (completedRequests.length / allRequests.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Maintenance Metrics</h2>
        <p className="text-muted-foreground">Detailed maintenance performance and analytics</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedRequests.length} of {allRequests?.length || 0} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Average across all completed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${performanceMetrics?.totalCost?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All maintenance expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.totalDowntime?.toLocaleString() || 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              Minutes of cart downtime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Upcoming */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Overdue Maintenance
            </CardTitle>
            <CardDescription>
              Maintenance schedules that are past due
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueLoading ? (
              <div>Loading overdue items...</div>
            ) : (
              <div className="space-y-3">
                {overdueItems && overdueItems.length > 0 ? (
                  overdueItems.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <div className="font-medium">{item.carts?.qr_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.maintenance_type} - {item.carts?.store}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {formatDistance(new Date(item.next_due_date), new Date(), { addSuffix: true })}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No overdue maintenance items</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Maintenance
            </CardTitle>
            <CardDescription>
              Maintenance scheduled for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div>Loading upcoming items...</div>
            ) : (
              <div className="space-y-3">
                {upcomingItems && upcomingItems.length > 0 ? (
                  upcomingItems.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <div>
                        <div className="font-medium">{item.carts?.qr_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.maintenance_type} - {item.carts?.store}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {formatDistance(new Date(item.next_due_date), new Date(), { addSuffix: true })}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No upcoming maintenance scheduled</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Provider Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Performance</CardTitle>
          <CardDescription>
            Performance metrics for all maintenance providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Avg Duration</TableHead>
                  <TableHead>Total Jobs</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceMetrics?.providerStats?.map((provider: any) => {
                  const completionRate = provider.total > 0 ? (provider.completed / provider.total) * 100 : 0;
                  return (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">
                        {provider.company_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {completionRate.toFixed(1)}%
                          <Progress value={completionRate} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>${provider.avgCost.toFixed(2)}</TableCell>
                      <TableCell>{provider.avgDuration.toFixed(1)}h</TableCell>
                      <TableCell>{provider.total}</TableCell>
                      <TableCell>
                        <Badge variant={
                          completionRate >= 90 ? "default" : 
                          completionRate >= 70 ? "secondary" : "destructive"
                        }>
                          {completionRate >= 90 ? "Excellent" : 
                           completionRate >= 70 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Requests</CardTitle>
          <CardDescription>
            Latest maintenance activities across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Cart</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRequests?.slice(0, 10).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">#{request.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.description?.slice(0, 50)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      Cart #{request.cart_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {formatDistance(new Date(request.created_at), new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}