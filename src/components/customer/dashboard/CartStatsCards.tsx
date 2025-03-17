
import { ShoppingCart, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CartStatsProps {
  cartStats: {
    activeCarts: number;
    inactiveCarts: number;
    totalCarts: number;
    recentIssues: number;
  };
}

export function CartStatsCards({ cartStats }: CartStatsProps) {
  const activePercentage = Math.round((cartStats.activeCarts / cartStats.totalCarts) * 100);
  const inactivePercentage = Math.round((cartStats.inactiveCarts / cartStats.totalCarts) * 100);
  
  return (
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
  );
}
