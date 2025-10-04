import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, RefreshCw, Settings, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

export function CalendarIntegration() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<CalendarProvider[]>([
    { id: 'google', name: 'Google Calendar', icon: '📅', connected: false },
    { id: 'outlook', name: 'Outlook Calendar', icon: '📆', connected: false },
    { id: 'apple', name: 'Apple iCloud', icon: '🍎', connected: false }
  ]);
  
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: '15', // minutes
    includeNotes: true,
    remindersBefore: '30' // minutes
  });

  const handleConnect = async (providerId: string) => {
    toast({
      title: "Connecting...",
      description: `Connecting to ${providers.find(p => p.id === providerId)?.name}`
    });

    // Simulate OAuth flow
    setTimeout(() => {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId
            ? { ...p, connected: true, lastSync: new Date().toISOString() }
            : p
        )
      );
      
      toast({
        title: "Connected Successfully",
        description: "Calendar integration is now active"
      });
    }, 1500);
  };

  const handleDisconnect = (providerId: string) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === providerId
          ? { ...p, connected: false, lastSync: undefined }
          : p
      )
    );

    toast({
      title: "Disconnected",
      description: "Calendar integration has been disabled"
    });
  };

  const handleSync = (providerId: string) => {
    toast({
      title: "Syncing...",
      description: "Synchronizing maintenance schedules"
    });

    setTimeout(() => {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId
            ? { ...p, lastSync: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: "Sync Complete",
        description: "All maintenance schedules are up to date"
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Calendar Integration</h2>
        <p className="text-muted-foreground">
          Sync maintenance schedules with your calendar applications
        </p>
      </div>

      {/* Connected Calendars */}
      <div className="grid gap-4 md:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{provider.icon}</span>
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                </div>
                {provider.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
              {provider.lastSync && (
                <CardDescription>
                  Last synced: {new Date(provider.lastSync).toLocaleString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {provider.connected ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSync(provider.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDisconnect(provider.id)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleConnect(provider.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Synchronization Settings
          </CardTitle>
          <CardDescription>
            Configure how maintenance schedules sync with your calendars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync schedules at regular intervals
              </p>
            </div>
            <Switch
              checked={syncSettings.autoSync}
              onCheckedChange={(checked) =>
                setSyncSettings({ ...syncSettings, autoSync: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Notes</Label>
              <p className="text-sm text-muted-foreground">
                Sync maintenance notes and descriptions to calendar events
              </p>
            </div>
            <Switch
              checked={syncSettings.includeNotes}
              onCheckedChange={(checked) =>
                setSyncSettings({ ...syncSettings, includeNotes: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Sync Interval</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={syncSettings.syncInterval}
              onChange={(e) =>
                setSyncSettings({ ...syncSettings, syncInterval: e.target.value })
              }
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Default Reminder</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={syncSettings.remindersBefore}
              onChange={(e) =>
                setSyncSettings({ ...syncSettings, remindersBefore: e.target.value })
              }
            >
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>

          <Button className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Event Types</CardTitle>
          <CardDescription>
            Different types of maintenance events that will be synced
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium">Scheduled Maintenance</p>
                  <p className="text-sm text-muted-foreground">Regular preventive maintenance</p>
                </div>
              </div>
              <Badge>12 upcoming</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div>
                  <p className="font-medium">Inspections</p>
                  <p className="text-sm text-muted-foreground">Cart safety inspections</p>
                </div>
              </div>
              <Badge>5 upcoming</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium">Emergency Repairs</p>
                  <p className="text-sm text-muted-foreground">Urgent repair requests</p>
                </div>
              </div>
              <Badge variant="destructive">2 urgent</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Follow-up Checks</p>
                  <p className="text-sm text-muted-foreground">Post-maintenance verification</p>
                </div>
              </div>
              <Badge>3 upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
