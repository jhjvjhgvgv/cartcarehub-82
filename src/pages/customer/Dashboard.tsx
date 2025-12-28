import { useState, useEffect } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { CartStatsCards } from "@/components/customer/dashboard/CartStatsCards";
import { QuickActions } from "@/components/customer/dashboard/QuickActions";
import { RecentActivity } from "@/components/customer/dashboard/RecentActivity";
import { UserWelcome } from "@/components/dashboard/UserWelcome";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";
import { RealTimeCartStatus } from "@/components/store/dashboard/RealTimeCartStatus";
import { MaintenanceAlerts } from "@/components/store/dashboard/MaintenanceAlerts";
import { ReportingCenter } from "@/components/store/dashboard/ReportingCenter";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function CustomerDashboard() {
  const { profile } = useUserProfile();
  const [cartStats, setCartStats] = useState({
    activeCarts: 0,
    inactiveCarts: 0,
    totalCarts: 0,
    recentIssues: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch carts
        const { data: carts, error } = await supabase
          .from('carts')
          .select('*');

        if (error) throw error;

        // Use new status values
        const inServiceCarts = carts?.filter(c => c.status === 'in_service').length || 0;
        const outOfServiceCarts = carts?.filter(c => c.status === 'out_of_service').length || 0;
        const totalCarts = carts?.length || 0;

        // Fetch open issues count
        const { count: issuesCount } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        setCartStats({
          activeCarts: inServiceCarts,
          inactiveCarts: outOfServiceCarts,
          totalCarts,
          recentIssues: issuesCount || 0
        });

        // Fetch recent maintenance requests
        const { data: requests } = await supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const formattedActivities = requests?.map(req => ({
          id: req.id,
          type: 'maintenance_request',
          date: req.created_at,
          description: `${req.request_type} request - ${req.status}`,
          status: req.status
        })) || [];

        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carts' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <CustomerLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your shopping cart status and maintenance schedule
            </p>
          </div>
          
          <UserWelcome />
          <CartStatsCards cartStats={cartStats} />
          <MaintenanceAlerts />
          <RealTimeCartStatus />
          <ReportingCenter />
          <QuickActions />
          <RecentActivity recentActivities={activities} />
        </div>
      </CustomerLayout>
    </ErrorBoundary>
  );
}
