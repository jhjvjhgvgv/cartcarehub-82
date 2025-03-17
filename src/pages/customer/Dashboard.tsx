
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertTriangle, CheckCircle, XCircle, Calendar, Tool, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { EmergencyRepairDialog } from "@/components/customers/EmergencyRepairDialog";
import { InspectionRequestDialog } from "@/components/customers/InspectionRequestDialog";
import { AICartAssistant } from "@/components/customer/AICartAssistant";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// Sample recent activity data
const recentActivities = [
  {
    id: 1,
    type: "maintenance",
    date: "2025-03-15",
    description: "Regular maintenance completed",
    icon: Tool,
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
    icon: Tool,
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

  const activePercentage = Math.round((cartStats.activeCarts / cartStats.totalCarts) * 100);
  const inactivePercentage = Math.round((cartStats.inactiveCarts / cartStats.totalCarts) * 100);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
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

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Carts</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{cartStats.activeCarts}</div>
              <Progress className="mt-2" value={activePercentage} />
              <p className="text-xs text-muted-foreground mt-2">
                {activePercentage}% of total carts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Carts</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{cartStats.inactiveCarts}</div>
              <Progress className="mt-2" value={inactivePercentage} />
              <p className="text-xs text-muted-foreground mt-2">
                {inactivePercentage}% of total carts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carts</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{cartStats.totalCarts}</div>
              <p className="text-xs text-muted-foreground">All assigned carts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{cartStats.recentIssues}</div>
              <p className="text-xs text-muted-foreground">In the last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmergencyRepairDialog />
              <InspectionRequestDialog />
              <Button asChild className="w-full">
                <Link to="/customer/cart-status">Check Cart Status</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/customer/report-issue">Report an Issue</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Button variant="outline" size="sm" className="text-xs">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <Table>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-muted/30">
                        <TableCell className="py-2">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-muted p-2 flex-shrink-0">
                              <activity.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                                <span className={`text-xs ${getStatusColor(activity.status)} ml-2 font-medium capitalize`}>
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <AICartAssistant />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
