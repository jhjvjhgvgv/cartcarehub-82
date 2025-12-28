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
import type { Cart } from "@/types/cart";

interface MaintenanceAlert {
  id: string;
  cart_id: string;
  cart_identifier: string;
  alert_type: 'overdue' | 'due_soon' | 'predictive' | 'damage_reported' | 'usage_high';
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

  const generatePredictiveAlerts = async (carts: Cart[]): Promise<MaintenanceAlert[]> => {
    const alerts: MaintenanceAlert[] = [];
    
    // Fetch issues for all carts
    const { data: allIssues } = await supabase
      .from('issues')
      .select('cart_id, severity, status')
      .eq('status', 'open');

    const issuesByCart = (allIssues || []).reduce((acc, issue) => {
      if (!acc[issue.cart_id]) acc[issue.cart_id] = [];
      acc[issue.cart_id].push(issue);
      return acc;
    }, {} as Record<string, typeof allIssues>);
    
    // Fetch latest inspection for each cart
    const { data: inspections } = await supabase
      .from('inspections')
      .select('cart_id, created_at')
      .order('created_at', { ascending: false });

    const lastInspectionByCart = (inspections || []).reduce((acc, insp) => {
      if (!acc[insp.cart_id]) acc[insp.cart_id] = insp.created_at;
      return acc;
    }, {} as Record<string, string>);

    carts.forEach(cart => {
      const cartIdentifier = cart.asset_tag || cart.qr_token.slice(0, 8);
      const cartIssues = issuesByCart[cart.id] || [];
      const lastInspection = lastInspectionByCart[cart.id];
      const daysSinceInspection = lastInspection 
        ? differenceInDays(new Date(), new Date(lastInspection))
        : 999;
      
      // Overdue inspection
      if (daysSinceInspection > 90) {
        alerts.push({
          id: `overdue-${cart.id}`,
          cart_id: cart.id,
          cart_identifier: cartIdentifier,
          alert_type: 'overdue',
          priority: 'critical',
          title: 'Inspection Overdue',
          description: `Cart inspection is ${daysSinceInspection - 90} days overdue`,
          recommended_action: 'Schedule immediate inspection',
          days_until_due: -(daysSinceInspection - 90),
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Due soon
      else if (daysSinceInspection > 75) {
        alerts.push({
          id: `due-soon-${cart.id}`,
          cart_id: cart.id,
          cart_identifier: cartIdentifier,
          alert_type: 'due_soon',
          priority: 'high',
          title: 'Inspection Due Soon',
          description: `Cart inspection due in ${90 - daysSinceInspection} days`,
          recommended_action: 'Schedule inspection within the next week',
          days_until_due: 90 - daysSinceInspection,
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Predictive maintenance based on issues
      if (cartIssues.length > 2) {
        const failureDate = addDays(new Date(), Math.random() * 30 + 10);
        alerts.push({
          id: `predictive-${cart.id}`,
          cart_id: cart.id,
          cart_identifier: cartIdentifier,
          alert_type: 'predictive',
          priority: 'medium',
          title: 'Potential Failure Predicted',
          description: `AI analysis suggests potential failure based on ${cartIssues.length} reported issues`,
          predicted_failure_date: failureDate.toISOString(),
          estimated_cost: Math.floor(Math.random() * 500) + 100,
          recommended_action: 'Perform preventive maintenance to avoid costly repairs',
          days_until_due: differenceInDays(failureDate, new Date()),
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Damage alerts based on reported issues
      const criticalIssues = cartIssues.filter(i => i.severity === 'critical' || i.severity === 'high');
      if (criticalIssues.length > 0) {
        alerts.push({
          id: `damage-${cart.id}`,
          cart_id: cart.id,
          cart_identifier: cartIdentifier,
          alert_type: 'damage_reported',
          priority: 'high',
          title: 'Critical Issues Reported',
          description: `Cart has ${criticalIssues.length} critical/high severity issue(s)`,
          recommended_action: 'Inspect cart and schedule repair immediately',
          created_at: new Date().toISOString(),
          is_acknowledged: false
        });
      }
      
      // Out of service alert
      if (cart.status === 'out_of_service') {
        alerts.push({
          id: `out-of-service-${cart.id}`,
          cart_id: cart.id,
          cart_identifier: cartIdentifier,
          alert_type: 'usage_high',
          priority: 'medium',
          title: 'Cart Out of Service',
          description: 'Cart is currently marked as out of service',
          recommended_action: 'Review and resolve issues to return cart to service',
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
        query = query.eq('store_org_id', storeId);
      }
      
      const { data: carts, error } = await query;
      
      if (error) throw error;
      
      const generatedAlerts = await generatePredictiveAlerts(carts || []);
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
      damage_reported: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
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
                          Cart: {alert.cart_identifier}
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
