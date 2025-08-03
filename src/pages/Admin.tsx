import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  ShoppingCart, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  UserCheck,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Settings,
  BarChart3
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { SystemOverview } from "@/components/admin/SystemOverview";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProviderManagement } from "@/components/admin/ProviderManagement";
import { SystemAnalytics } from "@/components/admin/SystemAnalytics";
import { MaintenanceMetrics } from "@/components/admin/MaintenanceMetrics";
import { SystemSettings } from "@/components/admin/SystemSettings";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Master Admin Interface</h1>
          <p className="text-muted-foreground mt-2">
            System-wide administration and monitoring
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <ProviderManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SystemAnalytics />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <MaintenanceMetrics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}