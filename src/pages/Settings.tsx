import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceSettings from "@/components/settings/MaintenanceSettings";
import { MaintenanceConnectionManager } from "@/components/settings/MaintenanceConnectionManager";
import { ImprovedConnectionsManager } from "@/components/settings/ImprovedConnectionsManager";
import { ConnectionStatusHandler } from "@/components/settings/ConnectionStatusHandler";
import { ProviderVerificationPanel } from "@/components/settings/ProviderVerificationPanel";
import { ConnectionStatusDisplay } from "@/components/settings/ConnectionStatusDisplay";
import { ProfileCompletionCard } from "@/components/settings/ProfileCompletionCard";
import { AppDataManager } from "@/components/settings/AppDataManager";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { DesignNotes } from "@/components/settings/DesignNotes";

const Settings = () => {
  const { toast } = useToast();
  const { isMaintenanceUser } = useUserProfile();

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Updated",
      description: "Your notification settings have been saved.",
    });
  };

  return (
    <DashboardLayout>
      <ConnectionStatusHandler>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
              {/* Profile Completion */}
              <ProfileCompletionCard />

              {/* Connection Status */}
              <ConnectionStatusDisplay />

              {/* Provider Verification (for maintenance users only) */}
              {isMaintenanceUser && <ProviderVerificationPanel />}

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveNotifications} className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Email Notifications</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Receive cart status updates via email
                        </span>
                      </Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="cart-alerts" className="flex flex-col space-y-1">
                        <span>Cart Issue Alerts</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Get notified when carts report problems
                        </span>
                      </Label>
                      <Switch id="cart-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label
                        htmlFor="maintenance-reminders"
                        className="flex flex-col space-y-1"
                      >
                        <span>Maintenance Reminders</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Receive reminders for scheduled maintenance
                        </span>
                      </Label>
                      <Switch id="maintenance-reminders" />
                    </div>
                    <Button type="submit">Save Notification Settings</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceSettings />
          </TabsContent>

          <TabsContent value="stores">
            <div className="space-y-6">
              <ImprovedConnectionsManager />
              <MaintenanceConnectionManager />
            </div>
          </TabsContent>

          <TabsContent value="developer">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Developer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="console-logs" className="flex flex-col space-y-1">
                    <span>Verbose Console Logs</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Enable detailed logging for debugging
                    </span>
                  </Label>
                  <Switch id="console-logs" />
                </div>
              </CardContent>
            </Card>

            <AppDataManager />
          </TabsContent>
        </Tabs>
        
          {/* Design Notes Section */}
          <div className="pt-6 mt-10 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Product Roadmap & Future Potential</h2>
            <DesignNotes />
          </div>
        </div>
      </ConnectionStatusHandler>
    </DashboardLayout>
  );
};

export default Settings;
