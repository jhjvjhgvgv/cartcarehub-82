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
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const startDate = subDays(new Date(), daysAgo);

      // Fetch carts for status breakdown
      const { data: carts, error: cartsError } = await supabase
        .from('carts')
        .select('status');

      if (cartsError) throw cartsError;

      const inServiceCount = carts?.filter(c => c.status === 'in_service').length || 0;
      const outOfServiceCount = carts?.filter(c => c.status === 'out_of_service').length || 0;
      const retiredCount = carts?.filter(c => c.status === 'retired').length || 0;

      // Fetch work orders for time series
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (workOrdersError) throw workOrdersError;

      // Fetch open issues count
      const { count: issuesCount } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Process data for charts
      const statusBreakdown = [
        { name: 'In Service', value: inServiceCount },
        { name: 'Out of Service', value: outOfServiceCount },
        { name: 'Retired', value: retiredCount }
      ].filter(item => item.value > 0);

      // Group work orders by date
      const ordersByDate = workOrders?.reduce((acc: any, wo: any) => {
        const date = format(new Date(wo.created_at), 'MM/dd');
        if (!acc[date]) {
          acc[date] = { date, orders: 0 };
        }
        acc[date].orders += 1;
        return acc;
      }, {});

      const timeSeriesData = Object.values(ordersByDate || {});

      setAnalytics({
        summary: {
          total_carts: carts?.length || 0,
          in_service: inServiceCount,
          out_of_service: outOfServiceCount,
          open_issues: issuesCount || 0,
          utilization_rate: carts?.length ? Math.round((inServiceCount / carts.length) * 100) : 0
        },
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
      ['Total Carts', analytics?.summary?.total_carts || 0],
      ['In Service', analytics?.summary?.in_service || 0],
      ['Out of Service', analytics?.summary?.out_of_service || 0],
      ['Utilization Rate', `${analytics?.summary?.utilization_rate || 0}%`],
      ['Open Issues', analytics?.summary?.open_issues || 0],
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
                  <p className="text-2xl font-bold">{analytics?.summary?.total_carts || 0}</p>
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
                  <p className="text-2xl font-bold">{analytics?.summary?.utilization_rate || 0}%</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Service</p>
                  <p className="text-2xl font-bold">{analytics?.summary?.in_service || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold">{analytics?.summary?.open_issues || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Cart Status</TabsTrigger>
            <TabsTrigger value="trends">Work Order Trends</TabsTrigger>
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
                <CardTitle>Work Order Trends</CardTitle>
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
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      name="Work Orders"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
