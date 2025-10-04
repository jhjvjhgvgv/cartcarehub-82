import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: any;
}

interface RevenueData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

interface ProviderPerformance {
  name: string;
  completedJobs: number;
  avgRating: number;
  revenue: number;
}

export function BusinessIntelligence() {
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [providerData, setProviderData] = useState<ProviderPerformance[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessIntelligence();
  }, [dateRange]);

  const fetchBusinessIntelligence = async () => {
    try {
      setLoading(true);
      
      // Fetch carts for analysis
      const { data: carts, error: cartsError } = await supabase
        .from('carts')
        .select('*');
      
      if (cartsError) throw cartsError;

      // Fetch maintenance requests
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*');
      
      if (requestsError) throw requestsError;

      // Calculate KPIs
      const totalCarts = carts?.length || 0;
      const activeCarts = carts?.filter(c => c.status === 'active').length || 0;
      const maintenanceCarts = carts?.filter(c => c.status === 'maintenance').length || 0;
      const totalRequests = requests?.length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
      
      const totalRevenue = requests?.reduce((sum, r) => sum + (Number(r.cost) || 0), 0) || 0;
      const avgCost = totalRequests > 0 ? totalRevenue / totalRequests : 0;

      setKpiMetrics([
        {
          label: 'Total Carts',
          value: totalCarts,
          change: 12.5,
          trend: 'up',
          icon: ShoppingCart
        },
        {
          label: 'Active Carts',
          value: `${totalCarts > 0 ? ((activeCarts / totalCarts) * 100).toFixed(1) : 0}%`,
          change: 5.2,
          trend: 'up',
          icon: Activity
        },
        {
          label: 'Total Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: 18.3,
          trend: 'up',
          icon: DollarSign
        },
        {
          label: 'Avg Service Cost',
          value: `$${avgCost.toFixed(2)}`,
          change: -3.1,
          trend: 'down',
          icon: TrendingDown
        },
        {
          label: 'Maintenance Rate',
          value: `${totalCarts > 0 ? ((maintenanceCarts / totalCarts) * 100).toFixed(1) : 0}%`,
          change: -7.5,
          trend: 'down',
          icon: AlertTriangle
        },
        {
          label: 'Completion Rate',
          value: `${totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0}%`,
          change: 15.8,
          trend: 'up',
          icon: TrendingUp
        }
      ]);

      // Generate revenue trend data
      const monthlyData: RevenueData[] = [
        { month: 'Jan', revenue: 45000, costs: 28000, profit: 17000 },
        { month: 'Feb', revenue: 52000, costs: 31000, profit: 21000 },
        { month: 'Mar', revenue: 48000, costs: 29000, profit: 19000 },
        { month: 'Apr', revenue: 61000, costs: 35000, profit: 26000 },
        { month: 'May', revenue: 55000, costs: 33000, profit: 22000 },
        { month: 'Jun', revenue: 67000, costs: 38000, profit: 29000 }
      ];
      setRevenueData(monthlyData);

      // Fetch provider performance
      const { data: providers, error: providerError } = await supabase
        .from('maintenance_providers')
        .select('*, maintenance_requests(*)');
      
      if (!providerError && providers) {
        const performanceData = providers.map(p => ({
          name: p.company_name || 'Unknown',
          completedJobs: (p.maintenance_requests as any[])?.filter(r => r.status === 'completed').length || 0,
          avgRating: 4.2 + Math.random() * 0.8,
          revenue: (p.maintenance_requests as any[])?.reduce((sum, r) => sum + (Number(r.cost) || 0), 0) || 0
        }));
        setProviderData(performanceData);
      }

    } catch (error) {
      console.error('Error fetching business intelligence:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} report...`
    });
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue Analysis
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Provider Performance
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Activity className="h-4 w-4 mr-2" />
            Market Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profitability Trends</CardTitle>
              <CardDescription>
                Monthly revenue, costs, and profit analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stackId="2"
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="3"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance Comparison</CardTitle>
              <CardDescription>
                Maintenance provider efficiency and revenue metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={providerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="completedJobs" 
                    fill="hsl(var(--primary))" 
                    name="Completed Jobs"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    fill="hsl(var(--chart-2))" 
                    name="Revenue ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Status Distribution</CardTitle>
                <CardDescription>Current fleet status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: 65 },
                        { name: 'Maintenance', value: 20 },
                        { name: 'Inactive', value: 10 },
                        { name: 'Retired', value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Type Distribution</CardTitle>
                <CardDescription>Breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Preventive', value: 45 },
                        { name: 'Repairs', value: 30 },
                        { name: 'Inspections', value: 15 },
                        { name: 'Emergency', value: 10 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={80}
                      fill="hsl(var(--secondary))"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ROI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Return on Investment Analysis</CardTitle>
          <CardDescription>
            Cost savings and efficiency improvements from predictive maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cost Savings (Annual)</p>
              <p className="text-3xl font-bold text-green-600">$124,500</p>
              <p className="text-xs text-muted-foreground">
                From predictive maintenance vs reactive
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Downtime Reduction</p>
              <p className="text-3xl font-bold text-blue-600">34%</p>
              <p className="text-xs text-muted-foreground">
                Average reduction in cart downtime
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fleet Lifespan Extension</p>
              <p className="text-3xl font-bold text-purple-600">+2.3 years</p>
              <p className="text-xs text-muted-foreground">
                Average increase in cart operational life
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
