import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FileText, 
  Download, 
  CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

import { DateRange } from "react-day-picker";
import { addDays, format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  period: string;
  total_carts: number;
  active_carts: number;
  maintenance_requests: number;
  completed_maintenance: number;
  total_cost: number;
  downtime_hours: number;
  satisfaction_score: number;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface PerformanceMetrics {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ReportingCenterProps {
  storeId?: string;
}

export function ReportingCenter({ storeId }: ReportingCenterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const { toast } = useToast();

  // Generate sample data
  const generateReportData = () => {
    const data: ReportData[] = [];
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        period: format(date, 'MMM dd'),
        total_carts: 50 + Math.floor(Math.random() * 10),
        active_carts: 40 + Math.floor(Math.random() * 8),
        maintenance_requests: Math.floor(Math.random() * 5),
        completed_maintenance: Math.floor(Math.random() * 4),
        total_cost: Math.floor(Math.random() * 1000) + 500,
        downtime_hours: Math.floor(Math.random() * 8),
        satisfaction_score: 8.5 + Math.random() * 1.5
      });
    }
    
    return data;
  };

  const generateCostBreakdown = (): CostBreakdown[] => {
    const total = 15000;
    return [
      { category: 'Routine Maintenance', amount: 6000, percentage: 40 },
      { category: 'Repairs', amount: 4500, percentage: 30 },
      { category: 'Parts Replacement', amount: 3000, percentage: 20 },
      { category: 'Emergency Service', amount: 1500, percentage: 10 },
    ];
  };

  const generatePerformanceMetrics = (): PerformanceMetrics[] => {
    return [
      {
        metric: 'Cart Availability',
        current: 94.5,
        previous: 92.1,
        change: 2.4,
        trend: 'up'
      },
      {
        metric: 'Maintenance Efficiency',
        current: 87.3,
        previous: 85.8,
        change: 1.5,
        trend: 'up'
      },
      {
        metric: 'Average Repair Time',
        current: 2.3,
        previous: 2.8,
        change: -0.5,
        trend: 'up'
      },
      {
        metric: 'Customer Satisfaction',
        current: 4.7,
        previous: 4.5,
        change: 0.2,
        trend: 'up'
      },
      {
        metric: 'Cost Per Cart',
        current: 245,
        previous: 267,
        change: -22,
        trend: 'up'
      },
      {
        metric: 'Preventive vs Reactive',
        current: 75,
        previous: 68,
        change: 7,
        trend: 'up'
      }
    ];
  };

  useEffect(() => {
    setReportData(generateReportData());
    setCostBreakdown(generateCostBreakdown());
    setPerformanceMetrics(generatePerformanceMetrics());
  }, [dateRange, reportType]);

  const exportReport = (format: 'csv' | 'pdf') => {
    setLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()} format`,
      });
    }, 2000);
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' && change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'up' && change < 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reporting Center
        </CardTitle>
        <CardDescription>
          Comprehensive analytics and reports for cart maintenance operations
        </CardDescription>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Input
              type="date"
              value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
              onChange={(e) => setDateRange({ from: new Date(e.target.value), to: dateRange?.to || new Date() })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Export</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportReport('csv')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportReport('pdf')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Active Carts</span>
                  </div>
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-xs text-muted-foreground">94% uptime</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Maintenance</span>
                  </div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Total Cost</span>
                  </div>
                  <div className="text-2xl font-bold">$12.5K</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Avg. Downtime</span>
                  </div>
                  <div className="text-2xl font-bold">2.3h</div>
                  <div className="text-xs text-muted-foreground">Per incident</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cart Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active_carts" fill="#10b981" name="Active Carts" />
                    <Bar dataKey="maintenance_requests" fill="#f59e0b" name="Maintenance" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="maintenance_requests" 
                      stroke="#f59e0b" 
                      name="Maintenance Requests"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed_maintenance" 
                      stroke="#10b981" 
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Bar dataKey="total_cost" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric) => (
                <Card key={metric.metric}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-2xl font-bold">
                          {metric.current}
                          {metric.metric.includes('Time') ? 'h' : 
                           metric.metric.includes('Cost') ? '' : 
                           metric.metric.includes('Satisfaction') ? '/5' : '%'}
                        </div>
                      </div>
                      {getTrendIcon(metric.trend, metric.change)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {metric.change > 0 ? '+' : ''}{metric.change}
                        {metric.metric.includes('Time') ? 'h' : 
                         metric.metric.includes('Cost') ? '' : 
                         metric.metric.includes('Satisfaction') ? '' : '%'}
                      </span>
                      <span className="text-muted-foreground">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}