import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Target
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";

interface WorkOrderWithProvider {
  id: string;
  status: string;
  summary: string | null;
  notes: string | null;
  scheduled_at: string | null;
  created_at: string;
  provider_org_id: string | null;
  store_org_id: string;
}

export function MaintenanceMetrics() {
  // Fetch work orders instead of legacy maintenance_requests
  const { data: workOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkOrderWithProvider[];
    }
  });

  // Fetch store daily rollups for downtime metrics
  const { data: rollups, isLoading: rollupsLoading } = useQuery({
    queryKey: ['admin-store-rollups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_daily_rollups')
        .select('*')
        .order('day', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch issues for cost data
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['admin-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch overdue maintenance (work orders past scheduled date)
  const { data: overdueOrders } = useQuery({
    queryKey: ['admin-overdue-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, organizations!work_orders_store_org_id_fkey(name)')
        .lt('scheduled_at', new Date().toISOString())
        .in('status', ['new', 'scheduled']);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch upcoming maintenance
  const { data: upcomingOrders } = useQuery({
    queryKey: ['admin-upcoming-orders'],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, organizations!work_orders_store_org_id_fkey(name)')
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', futureDate.toISOString())
        .in('status', ['new', 'scheduled', 'in_progress']);
      
      if (error) throw error;
      return data;
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
      case 'assigned':
        return <Badge variant="outline">Assigned</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (ordersLoading || rollupsLoading || issuesLoading) {
    return <div className="flex items-center justify-center p-8">Loading maintenance metrics...</div>;
  }

  const completedOrders = workOrders?.filter(o => o.status === 'completed') || [];
  const totalOrders = workOrders?.length || 0;
  
  const completionRate = totalOrders > 0 
    ? (completedOrders.length / totalOrders) * 100 
    : 0;

  // Calculate costs from issues
  const totalCost = issues?.reduce((sum, issue) => sum + (Number(issue.actual_cost) || Number(issue.est_cost) || 0), 0) || 0;
  
  // Calculate downtime from rollups
  const totalDowntime = rollups?.reduce((sum, r) => sum + (r.downtime_minutes || 0), 0) || 0;
  
  // Calculate total issues
  const totalIssues = issues?.length || 0;

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
              {completedOrders.length} of {totalOrders} work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Total reported issues
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
              ${totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All maintenance expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDowntime.toLocaleString()}m
            </div>
            <p className="text-xs text-muted-foreground">
              Minutes of cart downtime (30d)
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
              Overdue Work Orders
            </CardTitle>
            <CardDescription>
              Work orders that are past their scheduled date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueOrders && overdueOrders.length > 0 ? (
                overdueOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <div className="font-medium">#{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.summary || 'No summary'} - {order.organizations?.name || 'Unknown Store'}
                      </div>
                    </div>
                    <Badge variant="destructive">
                      {order.scheduled_at ? formatDistance(new Date(order.scheduled_at), new Date(), { addSuffix: true }) : 'Not scheduled'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No overdue work orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Work Orders
            </CardTitle>
            <CardDescription>
              Work orders scheduled for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingOrders && upcomingOrders.length > 0 ? (
                upcomingOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                    <div>
                      <div className="font-medium">#{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.summary || 'No summary'} - {order.organizations?.name || 'Unknown Store'}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {order.scheduled_at ? formatDistance(new Date(order.scheduled_at), new Date(), { addSuffix: true }) : 'Not scheduled'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No upcoming work orders scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
          <CardDescription>
            Latest maintenance activities across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders?.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium font-mono">#{order.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {order.summary || order.notes || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.scheduled_at 
                        ? formatDistance(new Date(order.scheduled_at), new Date(), { addSuffix: true })
                        : 'Not scheduled'
                      }
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
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
