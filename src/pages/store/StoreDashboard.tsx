import React, { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/OrgContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, CheckCircle, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface DashboardStats {
  totalCarts: number;
  inServiceCarts: number;
  outOfServiceCarts: number;
  inspections7Days: number;
  inspections30Days: number;
  openIssuesBySeverity: Record<string, number>;
  uptimePercent: number;
}

export const StoreDashboard: React.FC = () => {
  const { activeOrgId, activeOrg } = useOrg();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOrgId) {
      fetchStats();
    }
  }, [activeOrgId]);

  const fetchStats = async () => {
    if (!activeOrgId) return;

    setIsLoading(true);
    try {
      // Fetch carts
      const { data: carts } = await supabase
        .from('carts')
        .select('id, status')
        .eq('store_org_id', activeOrgId);

      const totalCarts = carts?.length || 0;
      const inServiceCarts = carts?.filter(c => c.status === 'in_service').length || 0;
      const outOfServiceCarts = carts?.filter(c => c.status === 'out_of_service').length || 0;

      // Fetch inspections
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const { data: inspections7 } = await supabase
        .from('inspections')
        .select('id')
        .eq('store_org_id', activeOrgId)
        .gte('created_at', sevenDaysAgo);

      const { data: inspections30 } = await supabase
        .from('inspections')
        .select('id')
        .eq('store_org_id', activeOrgId)
        .gte('created_at', thirtyDaysAgo);

      // Fetch open issues by severity
      const { data: issues } = await supabase
        .from('issues')
        .select('severity')
        .eq('store_org_id', activeOrgId)
        .eq('status', 'open');

      const openIssuesBySeverity: Record<string, number> = {};
      issues?.forEach(issue => {
        openIssuesBySeverity[issue.severity] = (openIssuesBySeverity[issue.severity] || 0) + 1;
      });

      // Calculate uptime % based on cart_status_events
      const { data: events } = await supabase
        .from('cart_status_events')
        .select('cart_id, status, occurred_at')
        .eq('store_org_id', activeOrgId)
        .gte('occurred_at', thirtyDaysAgo)
        .order('occurred_at', { ascending: true });

      let uptimePercent = 100;
      if (events && events.length > 0 && totalCarts > 0) {
        // Simplified uptime calculation: ratio of in_service events to total events
        const inServiceEvents = events.filter(e => e.status === 'in_service').length;
        uptimePercent = Math.round((inServiceEvents / events.length) * 100);
      }

      setStats({
        totalCarts,
        inServiceCarts,
        outOfServiceCarts,
        inspections7Days: inspections7?.length || 0,
        inspections30Days: inspections30?.length || 0,
        openIssuesBySeverity,
        uptimePercent,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const inServicePercent = stats?.totalCarts ? Math.round((stats.inServiceCarts / stats.totalCarts) * 100) : 0;
  const totalOpenIssues = Object.values(stats?.openIssuesBySeverity || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{activeOrg?.name || 'Store'} Dashboard</h1>
        <p className="text-muted-foreground">Overview of your shopping cart fleet</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Carts"
          value={stats?.totalCarts || 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="In your fleet"
        />
        <KPICard
          title="In Service"
          value={`${stats?.inServiceCarts || 0} (${inServicePercent}%)`}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          description="Available for use"
          variant="success"
        />
        <KPICard
          title="Out of Service"
          value={stats?.outOfServiceCarts || 0}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          description="Need attention"
          variant="warning"
        />
        <KPICard
          title="30-Day Uptime"
          value={`${stats?.uptimePercent || 100}%`}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          description="Fleet availability"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last 7 days</span>
                <span className="font-medium">{stats?.inspections7Days || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last 30 days</span>
                <span className="font-medium">{stats?.inspections30Days || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats?.openIssuesBySeverity || {}).length > 0 ? (
                Object.entries(stats?.openIssuesBySeverity || {}).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between">
                    <span className={`text-sm capitalize ${getSeverityColor(severity)}`}>
                      {severity}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No open issues</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/store/carts" className="block text-sm text-primary hover:underline">
                → Manage Carts
              </a>
              <a href="/store/scan" className="block text-sm text-primary hover:underline">
                → Scan Cart QR
              </a>
              <a href="/store/issues" className="block text-sm text-primary hover:underline">
                → View Issues
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, description, variant = 'default' }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-blue-500';
    default: return 'text-muted-foreground';
  }
};

export default StoreDashboard;
