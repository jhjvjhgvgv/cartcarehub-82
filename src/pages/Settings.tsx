
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceSettings from "@/components/settings/MaintenanceSettings";
import { StoreMaintenanceManager } from "@/components/settings/StoreMaintenanceManager";
import { DevModeInstructions } from "@/components/settings/DevModeInstructions";
import { useToast } from "@/hooks/use-toast";
import { DesignNotes } from "@/components/settings/DesignNotes";

const Settings = () => {
  const { toast } = useToast();
  const [testMode, setTestMode] = React.useState(
    localStorage.getItem("testMode") === "true"
  );

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Updated",
      description: "Your notification settings have been saved.",
    });
  };

  const toggleTestMode = () => {
    const newValue = !testMode;
    setTestMode(newValue);
    if (newValue) {
      localStorage.setItem("testMode", "true");
      toast({
        title: "Test Mode Enabled",
        description: "You can now access test features.",
      });
    } else {
      localStorage.removeItem("testMode");
      toast({
        title: "Test Mode Disabled",
        description: "Test features are now hidden.",
      });
    }
  };

  return (
    <DashboardLayout>
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

              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Your email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Your company" />
                    </div>
                    <Button type="button">Update Profile</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceSettings />
          </TabsContent>

          <TabsContent value="stores">
            <StoreMaintenanceManager isMaintenance={true} />
          </TabsContent>

          <TabsContent value="developer">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Developer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="test-mode" className="flex flex-col space-y-1">
                    <span>Test Mode</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Enable test features and data
                    </span>
                  </Label>
                  <Switch
                    id="test-mode"
                    checked={testMode}
                    onCheckedChange={toggleTestMode}
                  />
                </div>
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

            <DevModeInstructions />
          </TabsContent>
        </Tabs>
        
        {/* Design Notes Section */}
        <div className="pt-6 mt-10 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">Product Roadmap & Future Potential</h2>
          <DesignNotes />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
