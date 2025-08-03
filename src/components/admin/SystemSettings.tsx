import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe,
  Lock,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "CartRepairPros",
    systemDescription: "Professional cart maintenance management system",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    
    // Security Settings
    allowSignups: true,
    requireEmailVerification: true,
    sessionTimeout: 24,
    enforceStrongPasswords: true,
    enableTwoFactor: false,
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    maintenanceReminders: true,
    overdueAlerts: true,
    
    // Maintenance Settings
    defaultReminderDays: 7,
    autoAssignProviders: false,
    requireApproval: true,
    maxRequestsPerProvider: 50,
    
    // Data Settings
    dataRetentionMonths: 24,
    enableAuditLog: true,
    enableAnalytics: true,
    autoBackup: true
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Here you would save settings to the database
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Data export has been initiated. You will receive an email when complete.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Ready",
      description: "Please select a file to import system data.",
    });
  };

  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic system configuration and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea
                id="systemDescription"
                value={settings.systemDescription}
                onChange={(e) => setSettings({ ...settings, systemDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              User authentication and security policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowSignups">Allow User Signups</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
              </div>
              <Switch
                id="allowSignups"
                checked={settings.allowSignups}
                onCheckedChange={(checked) => setSettings({ ...settings, allowSignups: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify email before access</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enforceStrongPasswords">Enforce Strong Passwords</Label>
                <p className="text-sm text-muted-foreground">Require complex password criteria</p>
              </div>
              <Switch
                id="enforceStrongPasswords"
                checked={settings.enforceStrongPasswords}
                onCheckedChange={(checked) => setSettings({ ...settings, enforceStrongPasswords: checked })}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemAlerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">Enable system-wide alert notifications</p>
              </div>
              <Switch
                id="systemAlerts"
                checked={settings.systemAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceReminders">Maintenance Reminders</Label>
                <p className="text-sm text-muted-foreground">Send automated maintenance reminders</p>
              </div>
              <Switch
                id="maintenanceReminders"
                checked={settings.maintenanceReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceReminders: checked })}
              />
            </div>
            <div>
              <Label htmlFor="defaultReminderDays">Default Reminder Days</Label>
              <Input
                id="defaultReminderDays"
                type="number"
                value={settings.defaultReminderDays}
                onChange={(e) => setSettings({ ...settings, defaultReminderDays: parseInt(e.target.value) })}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Data retention, backup, and import/export settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dataRetentionMonths">Data Retention (months)</Label>
              <Input
                id="dataRetentionMonths"
                type="number"
                value={settings.dataRetentionMonths}
                onChange={(e) => setSettings({ ...settings, dataRetentionMonths: parseInt(e.target.value) })}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long to keep historical data before archival
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Track all system changes and access</p>
              </div>
              <Switch
                id="enableAuditLog"
                checked={settings.enableAuditLog}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAuditLog: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Enable daily automatic backups</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
              />
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and status information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Connection</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Status</span>
                  <Badge variant="secondary">
                    Last: 2 hours ago
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Usage</span>
                  <Badge variant="outline">2.3 GB / 10 GB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Calls (24h)</span>
                  <Badge variant="outline">1,247</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Uptime</span>
                  <Badge variant="default">99.9%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleResetSettings}>
          <Trash2 className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}