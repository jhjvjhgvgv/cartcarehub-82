import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Save, 
  Database, 
  Mail, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAdminUpdateConfig } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";

interface ConfigItem {
  key: string;
  value: any;
  type: 'boolean' | 'number' | 'string';
  label: string;
  description: string;
  category: 'maintenance' | 'notifications' | 'security' | 'system';
}

const defaultConfigs: ConfigItem[] = [
  {
    key: 'maintenance_schedule_buffer_days',
    value: 7,
    type: 'number',
    label: 'Maintenance Schedule Buffer (Days)',
    description: 'Number of days in advance to schedule maintenance requests',
    category: 'maintenance'
  },
  {
    key: 'max_cart_downtime_minutes',
    value: 120,
    type: 'number',
    label: 'Maximum Cart Downtime (Minutes)',
    description: 'Maximum allowed downtime before triggering alerts',
    category: 'maintenance'
  },
  {
    key: 'notification_email_enabled',
    value: true,
    type: 'boolean',
    label: 'Email Notifications',
    description: 'Enable email notifications for maintenance and system events',
    category: 'notifications'
  },
  {
    key: 'auto_schedule_maintenance',
    value: true,
    type: 'boolean',
    label: 'Auto-Schedule Maintenance',
    description: 'Automatically schedule maintenance requests based on predefined schedules',
    category: 'maintenance'
  },
  {
    key: 'system_maintenance_mode',
    value: false,
    type: 'boolean',
    label: 'System Maintenance Mode',
    description: 'Enable system-wide maintenance mode (restricts user access)',
    category: 'system'
  },
  {
    key: 'session_timeout_hours',
    value: 24,
    type: 'number',
    label: 'Session Timeout (Hours)',
    description: 'How long user sessions remain active',
    category: 'security'
  },
  {
    key: 'require_provider_verification',
    value: true,
    type: 'boolean',
    label: 'Require Provider Verification',
    description: 'Require admin verification before maintenance providers can accept connections',
    category: 'security'
  }
];

export function AdminSystemSettings() {
  const [configs, setConfigs] = useState<ConfigItem[]>(defaultConfigs);
  const [changedConfigs, setChangedConfigs] = useState<Set<string>>(new Set());
  const updateConfigMutation = useAdminUpdateConfig();
  const { toast } = useToast();

  const updateConfig = (key: string, value: any) => {
    setConfigs(prev => prev.map(config => 
      config.key === key ? { ...config, value } : config
    ));
    setChangedConfigs(prev => new Set([...prev, key]));
  };

  const saveConfig = async (config: ConfigItem) => {
    try {
      await updateConfigMutation.mutateAsync({
        config_key: config.key,
        config_value: config.value
      });
      setChangedConfigs(prev => {
        const newSet = new Set(prev);
        newSet.delete(config.key);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const saveAllChanges = async () => {
    const changedConfigItems = configs.filter(config => changedConfigs.has(config.key));
    
    for (const config of changedConfigItems) {
      try {
        await updateConfigMutation.mutateAsync({
          config_key: config.key,
          config_value: config.value
        });
      } catch (error) {
        console.error(`Failed to save ${config.key}:`, error);
      }
    }
    
    setChangedConfigs(new Set());
    toast({
      title: "Settings Saved",
      description: `Updated ${changedConfigItems.length} configuration settings`,
      duration: 3000,
    });
  };

  const renderConfigField = (config: ConfigItem) => {
    const isChanged = changedConfigs.has(config.key);

    return (
      <div key={config.key} className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={config.key} className="font-medium">
                {config.label}
              </Label>
              {isChanged && (
                <Badge variant="secondary" className="text-xs">
                  Changed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {config.type === 'boolean' && (
              <Switch
                id={config.key}
                checked={config.value}
                onCheckedChange={(checked) => updateConfig(config.key, checked)}
              />
            )}
            {config.type === 'number' && (
              <Input
                id={config.key}
                type="number"
                value={config.value}
                onChange={(e) => updateConfig(config.key, parseInt(e.target.value) || 0)}
                className="w-20"
              />
            )}
            {config.type === 'string' && (
              <Input
                id={config.key}
                value={config.value}
                onChange={(e) => updateConfig(config.key, e.target.value)}
                className="w-40"
              />
            )}
            
            {isChanged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveConfig(config)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, ConfigItem[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <Clock className="h-5 w-5" />;
      case 'notifications': return <Mail className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'system': return <Database className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'maintenance': return 'Maintenance Settings';
      case 'notifications': return 'Notification Settings';
      case 'security': return 'Security Settings';
      case 'system': return 'System Settings';
      default: return 'Other Settings';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Manage system-wide settings and configuration parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {changedConfigs.size > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {changedConfigs.size > 0 
                  ? `${changedConfigs.size} unsaved changes` 
                  : 'All settings saved'}
              </span>
            </div>
            
            {changedConfigs.size > 0 && (
              <Button 
                onClick={saveAllChanges}
                disabled={updateConfigMutation.isPending}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateConfigMutation.isPending ? 'Saving...' : 'Save All Changes'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Categories */}
      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {getCategoryTitle(category)}
            </CardTitle>
            <CardDescription>
              Configure settings related to {category} functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryConfigs.map(renderConfigField)}
          </CardContent>
        </Card>
      ))}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-medium">Configuration Status</Label>
              <div className="text-sm text-muted-foreground">
                All system configurations are managed through this interface.
                Changes are applied immediately and logged for audit purposes.
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Recent Changes</Label>
              <div className="text-sm text-muted-foreground">
                Configuration changes are tracked in the admin activity log.
                View the Activities tab to see recent modifications.
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-xs text-muted-foreground">
            <strong>Warning:</strong> Some configuration changes may require system restart to take full effect.
            Changes to security settings should be made carefully and tested thoroughly.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}