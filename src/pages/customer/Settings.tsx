
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { StoreConnectionsManager } from "@/components/settings/StoreConnectionsManager";
import { StoreManager } from "@/components/settings/StoreManager";
import { StoreMaintenanceSummary } from "@/components/settings/StoreMaintenanceSummary";
import { DesignNotes } from "@/components/settings/DesignNotes";

const CustomerSettings = () => {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notifications.
          </p>
        </div>

        {/* Store-Maintenance Summary Dashboard */}
        <StoreMaintenanceSummary />

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Your phone number" />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Store Manager Component */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Store Management</h3>
          <StoreManager />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your cart status
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for important updates
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Connection Manager */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Maintenance Providers</h3>
          <StoreConnectionsManager />
        </div>
        
        {/* Design Notes Section */}
        <div className="pt-6 mt-10 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">Product Roadmap & Future Potential</h2>
          <DesignNotes />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;
