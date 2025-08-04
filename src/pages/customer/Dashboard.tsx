
import CustomerLayout from "@/components/CustomerLayout";
import { ConnectionStatusHandler } from "@/components/settings/ConnectionStatusHandler";
import { CartStatsCards } from "@/components/customer/dashboard/CartStatsCards";
import { QuickActions } from "@/components/customer/dashboard/QuickActions";
import { RecentActivity } from "@/components/customer/dashboard/RecentActivity";
import { UserWelcome } from "@/components/dashboard/UserWelcome";

export default function CustomerDashboard() {
  return (
    <CustomerLayout>
      <ConnectionStatusHandler showWarnings={true}>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your shopping cart status and maintenance schedule
            </p>
          </div>

        <UserWelcome />
        <CartStatsCards cartStats={{ activeCarts: 0, inactiveCarts: 0, totalCarts: 0, recentIssues: 0 }} />
        <QuickActions />
          <RecentActivity recentActivities={[]} />
        </div>
      </ConnectionStatusHandler>
    </CustomerLayout>
  );
}
