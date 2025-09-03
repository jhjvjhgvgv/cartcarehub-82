import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Clock,
  AlertTriangle,
  Calendar,
  Mail
} from "lucide-react";
import { 
  useCartAnalyticsSummary, 
  useBulkUpdateCartStatus, 
  useScheduleMaintenanceRequests,
  useMaintenanceNotifications 
} from "@/hooks/use-cart-analytics";

export function AdvancedAnalytics() {
  const { data: analytics, isLoading, error } = useCartAnalyticsSummary();
  const bulkUpdateMutation = useBulkUpdateCartStatus();
  const scheduleMaintenanceMutation = useScheduleMaintenanceRequests();
  const notificationMutation = useMaintenanceNotifications();

  const handleScheduleMaintenance = () => {
    scheduleMaintenanceMutation.mutate();
  };

  const handleSendOverdueNotifications = () => {
    notificationMutation.mutate({
      type: 'overdue_maintenance'
    });
  };

  const handleSendUpcomingNotifications = () => {
    notificationMutation.mutate({
      type: 'upcoming_maintenance'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load analytics data</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_carts}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                {analytics.summary.active_carts} Active
              </Badge>
              <Badge variant="secondary" className="text-xs ml-2">
                {analytics.summary.maintenance_carts} Maintenance
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.cart_utilization_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Carts in active use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.metrics.total_maintenance_cost}</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.metrics.avg_cost_per_cart} avg per cart
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Downtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.avg_downtime_minutes}m</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.total_issues_reported} issues reported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Operations</CardTitle>
          <CardDescription>
            Automated maintenance scheduling and notification management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleScheduleMaintenance}
              disabled={scheduleMaintenanceMutation.isPending}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {scheduleMaintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Due Maintenance'}
            </Button>

            <Button 
              variant="outline"
              onClick={handleSendOverdueNotifications}
              disabled={notificationMutation.isPending}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {notificationMutation.isPending ? 'Sending...' : 'Send Overdue Alerts'}
            </Button>

            <Button 
              variant="outline"
              onClick={handleSendUpcomingNotifications}
              disabled={notificationMutation.isPending}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {notificationMutation.isPending ? 'Sending...' : 'Send Upcoming Reminders'}
            </Button>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p><strong>Period:</strong> {analytics.period.from} to {analytics.period.to}</p>
            <p className="mt-1">
              Use these tools to automate maintenance scheduling and keep all stakeholders informed
              about maintenance activities and deadlines.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key performance indicators for the maintenance system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.summary.cart_utilization_rate >= 80 ? '✓' : '⚠'}
              </div>
              <p className="text-sm font-medium">Cart Utilization</p>
              <p className="text-xs text-muted-foreground">
                {analytics.summary.cart_utilization_rate >= 80 ? 'Optimal' : 'Below Target'}
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.metrics.avg_downtime_minutes < 30 ? '✓' : '⚠'}
              </div>
              <p className="text-sm font-medium">Downtime Control</p>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.avg_downtime_minutes < 30 ? 'Within Target' : 'Needs Attention'}
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.metrics.avg_cost_per_cart < 100 ? '✓' : '⚠'}
              </div>
              <p className="text-sm font-medium">Cost Efficiency</p>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.avg_cost_per_cart < 100 ? 'Cost Effective' : 'Review Required'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}