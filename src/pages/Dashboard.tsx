import DashboardLayout from "@/components/DashboardLayout";
import { ConnectionStatusHandler } from "@/components/settings/ConnectionStatusHandler";
import { UserWelcome } from "@/components/dashboard/UserWelcome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderManager } from "@/components/maintenance/dashboard/WorkOrderManager";
import { MaintenanceCalendar } from "@/components/maintenance/MaintenanceCalendar";
import { RouteOptimizer } from "@/components/maintenance/RouteOptimizer";
import { PredictiveMaintenanceAlerts } from "@/components/analytics/PredictiveMaintenanceAlerts";
import { useWorkOrders } from "@/hooks/use-maintenance";
import { ShoppingCart, Wrench, AlertTriangle, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: workOrders = [], isLoading } = useWorkOrders();

  const newOrders = workOrders.filter(wo => wo.status === 'new').length;
  const inProgressOrders = workOrders.filter(wo => wo.status === 'in_progress').length;
  const scheduledOrders = workOrders.filter(wo => wo.status === 'scheduled').length;
  const completedToday = workOrders.filter(wo => 
    wo.status === 'completed' && 
    wo.updated_at &&
    new Date(wo.updated_at).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    {
      title: "New Orders",
      value: newOrders,
      description: "Awaiting assignment",
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      title: "In Progress",
      value: inProgressOrders,
      description: "Active work orders",
      icon: Wrench,
      color: "text-blue-600",
    },
    {
      title: "Scheduled",
      value: scheduledOrders,
      description: "Upcoming work",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "Completed Today",
      value: completedToday,
      description: "Work done today",
      icon: ShoppingCart,
      color: "text-green-600",
    },
  ];

  return (
    <DashboardLayout>
      <ConnectionStatusHandler showWarnings={true}>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered maintenance management and predictive analytics
            </p>
          </div>

        {/* User Welcome Section */}
        <UserWelcome />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Predictive Maintenance Alerts */}
        <PredictiveMaintenanceAlerts />

        {/* Route Optimizer */}
        <RouteOptimizer />

        {/* Work Order Manager */}
        <WorkOrderManager />

        {/* Maintenance Calendar */}
        <MaintenanceCalendar />
        </div>
      </ConnectionStatusHandler>
    </DashboardLayout>
  );
}
