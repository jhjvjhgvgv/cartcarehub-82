import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Building2, 
  ShoppingCart,
  Link2,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/use-admin";

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load dashboard data</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>No dashboard data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(stats.users.breakdown || {}).map(([role, count]) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Providers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance_providers.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.maintenance_providers.verified} Verified
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.maintenance_providers.unverified} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shopping Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carts.total}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(stats.carts.by_status || {}).map(([status, count]) => (
                <Badge 
                  key={status} 
                  variant={status === 'active' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connections.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.connections.active} Active
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.connections.pending} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Current system status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {Math.floor(stats.system.uptime_hours).toLocaleString()} hours
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Admin Activities</span>
              <Badge variant="secondary">
                {stats.system.recent_admin_activities} in 24h
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              System is running normally with all services operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Indicators
            </CardTitle>
            <CardDescription>
              Key performance metrics across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {stats.maintenance_providers.verified > 0 ? '✓' : '⚠'}
                </div>
                <p className="text-xs font-medium">Provider Network</p>
                <p className="text-xs text-muted-foreground">
                  {stats.maintenance_providers.verified > 0 ? 'Healthy' : 'Needs Providers'}
                </p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {stats.connections.active > 0 ? '✓' : '⚠'}
                </div>
                <p className="text-xs font-medium">Connections</p>
                <p className="text-xs text-muted-foreground">
                  {stats.connections.active > 0 ? 'Active Network' : 'Low Activity'}
                </p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {stats.carts.total > 0 ? '✓' : '⚠'}
                </div>
                <p className="text-xs font-medium">Cart Management</p>
                <p className="text-xs text-muted-foreground">
                  {stats.carts.total > 0 ? 'Systems Online' : 'No Carts Tracked'}
                </p>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {stats.users.total > 1 ? '✓' : '⚠'}
                </div>
                <p className="text-xs font-medium">User Adoption</p>
                <p className="text-xs text-muted-foreground">
                  {stats.users.total > 1 ? 'Growing Base' : 'Need Users'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>
            System-wide management and monitoring dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Total Platform Users:</strong> {stats.users.total} users across all roles
            </p>
            <p>
              <strong>Service Provider Network:</strong> {stats.maintenance_providers.verified} verified providers ready to serve
            </p>
            <p>
              <strong>Cart Fleet:</strong> {stats.carts.total} shopping carts under active management
            </p>
            <p>
              <strong>Connection Health:</strong> {stats.connections.active} active store-provider relationships
            </p>
            <p className="mt-4 pt-2 border-t">
              Use the tabs above to manage users, providers, view analytics, and configure system settings.
              All administrative actions are logged for security and compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}