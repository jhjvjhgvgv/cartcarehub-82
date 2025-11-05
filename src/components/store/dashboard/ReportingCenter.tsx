import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileDown, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Clock,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function ReportingCenter() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState<{
    summary: any;
    statusBreakdown: Array<{ name: string; value: number }>;
    timeSeriesData: Array<any>;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = parseInt(timeRange);
      const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const { data: summary, error: summaryError } = await supabase
        .rpc('get_cart_analytics_summary', {
          store_id_param: null,
          date_from: startDate,
          date_to: endDate
        });

      if (summaryError) throw summaryError;

      const summaryData = summary as any;

      // Fetch maintenance requests for time series
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('created_at, status, cost, actual_duration')
        .gte('created_at', new Date(startDate).toISOString())
        .order('created_at', { ascending: true });

      if (requestsError) throw requestsError;

      // Process data for charts
      const statusBreakdown = [
        { name: 'Active', value: summaryData?.summary?.active_carts || 0 },
        { name: 'Maintenance', value: summaryData?.summary?.maintenance_carts || 0 },
        { name: 'Other', value: (summaryData?.summary?.total_carts || 0) - (summaryData?.summary?.active_carts || 0) - (summaryData?.summary?.maintenance_carts || 0) }
      ];

      // Group requests by date
      const requestsByDate = requests?.reduce((acc: any, req: any) => {
        const date = format(new Date(req.created_at), 'MM/dd');
        if (!acc[date]) {
          acc[date] = { date, requests: 0, cost: 0, duration: 0 };
        }
        acc[date].requests += 1;
        acc[date].cost += req.cost || 0;
        acc[date].duration += req.actual_duration || 0;
        return acc;
      }, {});

      const timeSeriesData = Object.values(requestsByDate || {});

      setAnalytics({
        summary: summaryData,
        statusBreakdown,
        timeSeriesData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being prepared for download...",
    });
    
    // Create CSV data
    const csvData = [
      ['Cart Analytics Report', ''],
      ['Generated', new Date().toLocaleString()],
      ['Time Range', `Last ${timeRange} days`],
      [''],
      ['Summary Metrics', ''],
      ['Total Carts', analytics?.summary?.summary?.total_carts || 0],
      ['Active Carts', analytics?.summary?.summary?.active_carts || 0],
      ['Maintenance Carts', analytics?.summary?.summary?.maintenance_carts || 0],
      ['Cart Utilization', `${analytics?.summary?.summary?.cart_utilization_rate || 0}%`],
      [''],
      ['Financial Metrics', ''],
      ['Total Maintenance Cost', `$${analytics?.summary?.metrics?.total_maintenance_cost || 0}`],
      ['Average Cost Per Cart', `$${analytics?.summary?.metrics?.avg_cost_per_cart || 0}`],
      [''],
      ['Operational Metrics', ''],
      ['Total Issues', analytics?.summary?.metrics?.total_issues_reported || 0],
      ['Avg Downtime (minutes)', analytics?.summary?.metrics?.avg_downtime_minutes || 0]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reporting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics & Reporting
            </CardTitle>
            <CardDescription>
              Comprehensive insights into cart performance and maintenance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Carts</p>
                  <p className="text-2xl font-bold">{analytics?.summary?.summary?.total_carts || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilization Rate</p>
                  <p className="text-2xl font-bold">{analytics?.summary?.summary?.cart_utilization_rate || 0}%</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${analytics?.summary?.metrics?.total_maintenance_cost || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issues Reported</p>
                  <p className="text-2xl font-bold">{analytics?.summary?.metrics?.total_issues_reported || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Cart Status</TabsTrigger>
            <TabsTrigger value="trends">Maintenance Trends</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {analytics?.statusBreakdown?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Request Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="hsl(var(--primary))" 
                      name="Requests"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" name="Cost ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
