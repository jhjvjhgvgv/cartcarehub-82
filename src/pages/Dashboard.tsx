
import DashboardLayout from "@/components/DashboardLayout";
import { ConnectionStatusHandler } from "@/components/settings/ConnectionStatusHandler";
import { UserWelcome } from "@/components/dashboard/UserWelcome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderManager } from "@/components/maintenance/dashboard/WorkOrderManager";
import { MaintenanceCalendar } from "@/components/maintenance/MaintenanceCalendar";
import { RouteOptimizer } from "@/components/maintenance/RouteOptimizer";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { ShoppingCart, Wrench, AlertTriangle, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: requests = [], isLoading } = useMaintenanceRequests();

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
  const scheduledRequests = requests.filter(r => r.status === 'scheduled').length;
  const completedToday = requests.filter(r => 
    r.status === 'completed' && 
    new Date(r.completed_date || '').toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    {
      title: "Pending Requests",
      value: pendingRequests,
      description: "Awaiting assignment",
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      title: "In Progress",
      value: inProgressRequests,
      description: "Active work orders",
      icon: Wrench,
      color: "text-blue-600",
    },
    {
      title: "Scheduled",
      value: scheduledRequests,
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
              Overview of all cart maintenance operations
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

        {/* Work Order Manager */}
        <WorkOrderManager />

        {/* Maintenance Calendar */}
        <MaintenanceCalendar />

        {/* Route Optimizer */}
        <RouteOptimizer />
        </div>
      </ConnectionStatusHandler>
    </DashboardLayout>
  );
}


