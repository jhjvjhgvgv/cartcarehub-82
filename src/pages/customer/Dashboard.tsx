
import CustomerLayout from "@/components/CustomerLayout";
import { ShoppingCart, AlertTriangle, Wrench, FileCheck, BarChart, Clock } from "lucide-react";
import { CartStatsCards } from "@/components/customer/dashboard/CartStatsCards";
import { QuickActions } from "@/components/customer/dashboard/QuickActions";
import { RecentActivity } from "@/components/customer/dashboard/RecentActivity";
import { AICartAssistant } from "@/components/customer/AICartAssistant";
import { KpiCard } from "@/components/customer/dashboard/KpiCard";
import { useState, useEffect } from "react";
import { isNewAccountSession } from "@/services/connection/storage-utils";

const CustomerDashboard = () => {
  const [isNewAccount, setIsNewAccount] = useState(false);

  // Check if this is a new account session
  useEffect(() => {
    setIsNewAccount(isNewAccountSession());
  }, []);

  // Sample recent activity data - only used for existing accounts
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

  // Only show stats for existing accounts
  const cartStats = isNewAccount ? {
    activeCarts: 0,
    inactiveCarts: 0,
    totalCarts: 0,
    recentIssues: 0
  } : {
    activeCarts: 2,
    inactiveCarts: 1,
    totalCarts: 3,
    recentIssues: 0
  };

  // For new accounts, show a welcome message
  if (isNewAccount) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to CartCareHub!</h1>
            <p className="text-muted-foreground">
              This is a fresh account with no sample data. Get started by adding your first cart or connecting with a maintenance provider.
            </p>
            <div className="mt-6 flex justify-center">
              <a 
                href="/customer/settings" 
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Go to Settings
              </a>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Monitor your shopping cart status and report any issues.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <KpiCard
            title="Cart Availability Rate"
            value="92%"
            icon={BarChart}
            description="Average uptime across all carts"
            trend={{ value: 3.2, isPositive: true }}
            iconClassName="bg-primary-50 text-primary"
          />
          <KpiCard
            title="Average Downtime"
            value="1.8 hrs"
            icon={Clock}
            description="Average downtime per cart this month"
            trend={{ value: 12.5, isPositive: false }}
            iconClassName="bg-red-50 text-red-500"
          />
        </div>

        <CartStatsCards cartStats={cartStats} />

        <div className="grid gap-6 md:grid-cols-2">
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
