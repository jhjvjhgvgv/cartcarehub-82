import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, User, Palette, Shield, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      {/* Profile Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
          </div>
          <Button type="submit">Save Profile</Button>
        </form>
      </div>

      <Separator />

      {/* Notifications Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your account via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Preferences Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle dark mode theme
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Security Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline" className="ml-4">Enable Two-Factor Auth</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;