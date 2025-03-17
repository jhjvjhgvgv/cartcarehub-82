
import CustomerLayout from "@/components/CustomerLayout";
import { ShoppingCart, AlertTriangle, Wrench, FileCheck } from "lucide-react";
import { CartStatsCards } from "@/components/customer/dashboard/CartStatsCards";
import { QuickActions } from "@/components/customer/dashboard/QuickActions";
import { RecentActivity } from "@/components/customer/dashboard/RecentActivity";
import { AICartAssistant } from "@/components/customer/AICartAssistant";

// Sample recent activity data
const recentActivities = [
  {
    id: 1,
    type: "maintenance",
    date: "2025-03-15",
    description: "Regular maintenance completed",
    icon: Wrench,
    status: "completed",
  },
  {
    id: 2,
    type: "inspection",
    date: "2025-03-10",
    description: "Cart #1042 inspection",
    icon: FileCheck,
    status: "completed",
  },
  {
    id: 3,
    type: "issue",
    date: "2025-03-08",
    description: "Reported wheel issue on Cart #1039",
    icon: AlertTriangle,
    status: "pending",
  },
  {
    id: 4,
    type: "maintenance",
    date: "2025-03-01",
    description: "Emergency repair request",
    icon: Wrench,
    status: "completed",
  },
];

const CustomerDashboard = () => {
  // This would typically come from an API
  const cartStats = {
    activeCarts: 2,
    inactiveCarts: 1,
    totalCarts: 3,
    recentIssues: 0
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Monitor your shopping cart status and report any issues.
          </p>
        </div>

        <CartStatsCards cartStats={cartStats} />

        <div className="grid gap-4 md:grid-cols-2">
          <QuickActions />
          <RecentActivity recentActivities={recentActivities} />
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <AICartAssistant />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
