
import DashboardLayout from "@/components/DashboardLayout";
import { ConnectionStatusHandler } from "@/components/settings/ConnectionStatusHandler";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { UserWelcome } from "@/components/dashboard/UserWelcome";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCarts } from "@/hooks/use-carts";
import { ShoppingCart, Wrench, AlertTriangle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { carts, isLoading } = useCarts();

  const totalCarts = carts?.length || 0;
  const activeCarts = carts?.filter(cart => cart.status === "active").length || 0;
  const maintenanceCarts = carts?.filter(cart => cart.status === "maintenance").length || 0;
  const retiredCarts = carts?.filter(cart => cart.status === "retired").length || 0;

  const stats = [
    {
      title: "Total Carts",
      value: totalCarts,
      description: "All carts in system",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Active Carts",
      value: activeCarts,
      description: "Currently in use",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Maintenance",
      value: maintenanceCarts,
      description: "Needs attention",
      icon: Wrench,
      color: "text-yellow-600",
    },
    {
      title: "Retired",
      value: retiredCarts,
      description: "Out of service",
      icon: AlertTriangle,
      color: "text-red-600",
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

        {/* Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Status Analytics</CardTitle>
            <CardDescription>
              Monthly trends for cart maintenance and status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart />
          </CardContent>
          </Card>
        </div>
      </ConnectionStatusHandler>
    </DashboardLayout>
  );
}


