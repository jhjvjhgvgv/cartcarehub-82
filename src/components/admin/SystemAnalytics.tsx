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
  TrendingUp, 
  TrendingDown, 
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

      // Get cart analytics
      const { data: cartAnalytics, error: cartError } = await supabase
        .from('cart_analytics')
        .select('*')
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0]);

      if (cartError) throw cartError;

      // Get maintenance requests
      const { data: requests, error: requestError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (requestError) throw requestError;

      // Get user registrations
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (profileError) throw profileError;

      return {
        cartAnalytics: cartAnalytics || [],
        requests: requests || [],
        profiles: profiles || []
      };
    }
  });

  // Process data for charts
  const processedData = analyticsData ? {
    dailyMetrics: processTimeSeriesData(analyticsData, parseInt(timeRange)),
    requestsByStatus: processRequestsByStatus(analyticsData.requests),
    costAnalysis: processCostAnalysis(analyticsData.cartAnalytics),
    userGrowth: processUserGrowth(analyticsData.profiles, parseInt(timeRange))
  } : null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <div>Loading analytics...</div>;
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
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${processedData?.costAnalysis.totalRevenue.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {processedData?.userGrowth.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{processedData?.userGrowth.newUsers || 0} this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  -15 min from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cart Utilization</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>
                Maintenance requests and cart usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData?.dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Request Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of maintenance request statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData?.requestsByStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(processedData?.requestsByStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Request Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Request Priority Levels</CardTitle>
                <CardDescription>
                  Distribution of maintenance request priorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { priority: 'urgent', count: 5, color: 'destructive' },
                    { priority: 'high', count: 12, color: 'secondary' },
                    { priority: 'medium', count: 28, color: 'default' },
                    { priority: 'low', count: 15, color: 'outline' }
                  ].map((item) => (
                    <div key={item.priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.color as any}>{item.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(item.count / 60) * 100} className="w-20" />
                        <span className="text-sm font-medium">{item.count}</span>
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
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Financial performance and cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData?.costAnalysis.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="cost" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                User registration and activity trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData?.userGrowth.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for data processing
function processTimeSeriesData(data: any, days: number) {
  // Process daily metrics for charts
  const dailyData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRequests = data.requests.filter((r: any) => 
      r.created_at.split('T')[0] === dateStr
    ).length;
    
    const dayCost = data.cartAnalytics
      .filter((a: any) => a.metric_date === dateStr)
      .reduce((sum: number, a: any) => sum + (Number(a.maintenance_cost) || 0), 0);
    
    dailyData.push({
      date: date.toLocaleDateString(),
      requests: dayRequests,
      cost: dayCost
    });
  }
  return dailyData;
}

function processRequestsByStatus(requests: any[]) {
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));
}

function processCostAnalysis(analytics: any[]) {
  const totalRevenue = analytics.reduce((sum, a) => sum + (Number(a.maintenance_cost) || 0), 0);
  
  return {
    totalRevenue,
    monthly: [] // Would process monthly data here
  };
}

function processUserGrowth(profiles: any[], days: number) {
  return {
    totalUsers: profiles.length,
    newUsers: profiles.filter(p => {
      const createdDate = new Date(p.created_at);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return createdDate >= cutoff;
    }).length,
    daily: [] // Would process daily growth data here
  };
}