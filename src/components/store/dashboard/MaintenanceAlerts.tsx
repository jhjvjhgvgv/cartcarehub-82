import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Clock, 
  Wrench, 
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, differenceInDays } from "date-fns";

interface MaintenanceAlert {
  id: string;
  cart_id: string;
  cart_qr_code: string;
  alert_type: 'overdue' | 'due_soon' | 'predictive' | 'battery_low' | 'usage_high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  predicted_failure_date?: string;
  estimated_cost?: number;
  recommended_action: string;
  days_until_due?: number;
  created_at: string;
  is_acknowledged: boolean;
}

interface MaintenanceAlertsProps {
  storeId?: string;
}

export function MaintenanceAlerts({ storeId }: MaintenanceAlertsProps) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unacknowledged'>('unacknowledged');
  const { toast } = useToast();

  const generatePredictiveAlerts = (carts: any[]): MaintenanceAlert[] => {
    const alerts: MaintenanceAlert[] = [];
    
    carts.forEach(cart => {
      const lastMaintenance = new Date(cart.last_maintenance);
      const daysSinceLastMaintenance = differenceInDays(new Date(), lastMaintenance);
      
      // Overdue maintenance
      if (daysSinceLastMaintenance > 90) {
        alerts.push({
          id: `overdue-${cart.id}`,
          cart_id: cart.id,
          cart_qr_code: cart.qr_code,
          alert_type: 'overdue',
          priority: 'critical',
          title: 'Maintenance Overdue',
          description: `Cart maintenance is ${daysSinceLastMaintenance - 90} days overdue`,
          recommended_action: 'Schedule immediate maintenance inspection',
          days_until_due: -(daysSinceLastMaintenance - 90),
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Due soon
      else if (daysSinceLastMaintenance > 75) {
        alerts.push({
          id: `due-soon-${cart.id}`,
          cart_id: cart.id,
          cart_qr_code: cart.qr_code,
          alert_type: 'due_soon',
          priority: 'high',
          title: 'Maintenance Due Soon',
          description: `Cart maintenance due in ${90 - daysSinceLastMaintenance} days`,
          recommended_action: 'Schedule maintenance within the next week',
          days_until_due: 90 - daysSinceLastMaintenance,
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Predictive maintenance based on issues
      if (cart.issues && cart.issues.length > 2) {
        const failureDate = addDays(new Date(), Math.random() * 30 + 10);
        alerts.push({
          id: `predictive-${cart.id}`,
          cart_id: cart.id,
          cart_qr_code: cart.qr_code,
          alert_type: 'predictive',
          priority: 'medium',
          title: 'Potential Failure Predicted',
          description: `AI analysis suggests potential failure based on ${cart.issues.length} reported issues`,
          predicted_failure_date: failureDate.toISOString(),
          estimated_cost: Math.floor(Math.random() * 500) + 100,
          recommended_action: 'Perform preventive maintenance to avoid costly repairs',
          days_until_due: differenceInDays(failureDate, new Date()),
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Battery alerts (simulated)
      const batteryLevel = Math.floor(Math.random() * 100);
      if (batteryLevel < 20) {
        alerts.push({
          id: `battery-${cart.id}`,
          cart_id: cart.id,
          cart_qr_code: cart.qr_code,
          alert_type: 'battery_low',
          priority: 'medium',
          title: 'Low Battery Level',
          description: `Cart battery at ${batteryLevel}% - charging recommended`,
          recommended_action: 'Charge cart battery or replace if degraded',
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // High usage alert
      if (Math.random() > 0.8) {
        alerts.push({
          id: `usage-${cart.id}`,
          cart_id: cart.id,
          cart_qr_code: cart.qr_code,
          alert_type: 'usage_high',
          priority: 'low',
          title: 'High Usage Detected',
          description: 'Cart showing higher than average usage patterns',
          recommended_action: 'Monitor for wear and consider more frequent inspections',
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const fetchAlertsData = async () => {
    try {
      let query = supabase.from('carts').select('*');
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      const { data: carts, error } = await query;
      
      if (error) throw error;
      
      const generatedAlerts = generatePredictiveAlerts(carts || []);
      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [storeId]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      )
    );
    
    toast({
      title: "Alert Acknowledged",
      description: "The alert has been marked as acknowledged",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been removed",
    });
  };

  const filteredAlerts = filter === 'unacknowledged' 
    ? alerts.filter(alert => !alert.is_acknowledged)
    : alerts;

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      overdue: <AlertTriangle className="h-4 w-4 text-red-500" />,
      due_soon: <Clock className="h-4 w-4 text-orange-500" />,
      predictive: <TrendingUp className="h-4 w-4 text-purple-500" />,
      battery_low: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      usage_high: <Wrench className="h-4 w-4 text-blue-500" />
    };
    return icons[type as keyof typeof icons] || icons.predictive;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Predictive Maintenance Alerts
        </CardTitle>
        <CardDescription>
          AI-powered alerts for proactive cart maintenance
        </CardDescription>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'unacknowledged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unacknowledged')}
          >
            Unacknowledged ({alerts.filter(a => !a.is_acknowledged).length})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Alerts ({alerts.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {filter === 'unacknowledged' 
                ? "No unacknowledged alerts. All carts are operating within normal parameters."
                : "No alerts found. Your carts are in excellent condition!"
              }
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.priority === 'critical' ? 'border-l-red-500' :
                alert.priority === 'high' ? 'border-l-orange-500' :
                alert.priority === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.alert_type)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Cart: {alert.cart_qr_code}
                        </p>
                        
                        <p className="text-sm">{alert.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {alert.days_until_due !== undefined && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {alert.days_until_due > 0 
                                ? `${alert.days_until_due} days remaining`
                                : `${Math.abs(alert.days_until_due)} days overdue`
                              }
                            </div>
                          )}
                          
                          {alert.estimated_cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Est. cost: ${alert.estimated_cost}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted p-2 rounded text-sm">
                          <strong>Recommended Action:</strong> {alert.recommended_action}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!alert.is_acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}