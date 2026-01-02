import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  Clock, 
  Users, 
  ShoppingCart 
} from "lucide-react";

export function SystemAnalytics() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get store daily rollups for metrics
      const { data: rollups, error: rollupsError } = await supabase
        .from('store_daily_rollups')
        .select('*')
        .gte('day', startDate.toISOString().split('T')[0])
        .lte('day', endDate.toISOString().split('T')[0]);

      if (rollupsError) throw rollupsError;

      // Get work orders
      const { data: workOrders, error: ordersError } = await supabase
        .from('work_orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Get issues for cost data
      const { data: issues, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (issuesError) throw issuesError;

      // Get organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, type, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (orgsError) throw orgsError;

      return {
        rollups: rollups || [],
        workOrders: workOrders || [],
        issues: issues || [],
        orgs: orgs || []
      };
    }
  });

  // Process data for charts
  const processedData = analyticsData ? {
    dailyMetrics: processTimeSeriesData(analyticsData, parseInt(timeRange)),
    ordersByStatus: processOrdersByStatus(analyticsData.workOrders),
    costAnalysis: processCostAnalysis(analyticsData.issues, analyticsData.rollups),
    orgGrowth: processOrgGrowth(analyticsData.orgs, parseInt(timeRange))
  } : null;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Analytics</h2>
          <p className="text-muted-foreground">Comprehensive system performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Work Orders</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="orgs">Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${processedData?.costAnalysis.totalCost.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maintenance costs this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Orgs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {processedData?.orgGrowth.newOrgs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Organizations added this period
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
                  {processedData?.costAnalysis.totalDowntime.toLocaleString() || 0}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Minutes of cart downtime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inspections</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {processedData?.costAnalysis.totalInspections || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inspections this period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>
                Work orders and issues over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData?.dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="workOrders" stroke="hsl(var(--primary))" strokeWidth={2} name="Work Orders" />
                  <Line type="monotone" dataKey="issues" stroke="hsl(var(--destructive))" strokeWidth={2} name="Issues" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Work Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of work order statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData?.ordersByStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {(processedData?.ordersByStatus || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Work Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Summary</CardTitle>
                <CardDescription>
                  Status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(processedData?.ordersByStatus || []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.name}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.value / (analyticsData?.workOrders.length || 1) * 100} className="w-20" />
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Financial performance and cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData?.dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Growth</CardTitle>
              <CardDescription>
                New organization registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold">{processedData?.orgGrowth.newOrgs || 0}</div>
                <p className="text-muted-foreground mt-2">New organizations this period</p>
                <div className="flex justify-center gap-4 mt-4">
                  <Badge variant="outline">{processedData?.orgGrowth.stores || 0} Stores</Badge>
                  <Badge variant="outline">{processedData?.orgGrowth.providers || 0} Providers</Badge>
                  <Badge variant="outline">{processedData?.orgGrowth.corps || 0} Corporations</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for data processing
function processTimeSeriesData(data: any, days: number) {
  const dailyData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = data.workOrders.filter((w: any) => 
      w.created_at.split('T')[0] === dateStr
    ).length;
    
    const dayIssues = data.issues.filter((i: any) => 
      i.created_at.split('T')[0] === dateStr
    ).length;
    
    const dayCost = data.issues
      .filter((i: any) => i.created_at.split('T')[0] === dateStr)
      .reduce((sum: number, i: any) => sum + (Number(i.actual_cost) || Number(i.est_cost) || 0), 0);
    
    dailyData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      workOrders: dayOrders,
      issues: dayIssues,
      cost: dayCost
    });
  }
  return dailyData;
}

function processOrdersByStatus(workOrders: any[]) {
  const statusCounts = workOrders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count as number
  }));
}

function processCostAnalysis(issues: any[], rollups: any[]) {
  const totalCost = issues.reduce((sum, i) => sum + (Number(i.actual_cost) || Number(i.est_cost) || 0), 0);
  const totalDowntime = rollups.reduce((sum, r) => sum + (r.downtime_minutes || 0), 0);
  const totalInspections = rollups.reduce((sum, r) => sum + (r.inspections_count || 0), 0);
  
  return {
    totalCost,
    totalDowntime,
    totalInspections
  };
}

function processOrgGrowth(orgs: any[], _days: number) {
  return {
    newOrgs: orgs.length,
    stores: orgs.filter(o => o.type === 'store').length,
    providers: orgs.filter(o => o.type === 'provider').length,
    corps: orgs.filter(o => o.type === 'corporation').length
  };
}
