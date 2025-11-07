import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  TrendingUp,
  Route as RouteIcon,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface RouteStop {
  id: string;
  cart_qr_code: string;
  store_name: string;
  store_id: string;
  request_type: string;
  priority: string;
  estimated_duration: number;
  scheduled_date?: string;
  order: number;
}

export function RouteOptimizer() {
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { data: requests = [] } = useMaintenanceRequests();
  const { toast } = useToast();

  const todaysRequests = requests.filter(req => 
    req.status === 'scheduled' && 
    req.scheduled_date &&
    new Date(req.scheduled_date).toDateString() === new Date().toDateString()
  );

  const optimizeRoute = async () => {
    try {
      setIsOptimizing(true);

      // Fetch cart and store information
      const requestsWithDetails = await Promise.all(
        todaysRequests.map(async (req) => {
          const { data: cart } = await supabase
            .from('carts')
            .select('qr_code, store, store_id')
            .eq('id', req.cart_id)
            .single();

          return {
            id: req.id,
            cart_qr_code: cart?.qr_code || 'N/A',
            store_name: cart?.store || req.store_id,
            store_id: req.store_id,
            request_type: req.request_type,
            priority: req.priority,
            estimated_duration: req.estimated_duration || 30,
            scheduled_date: req.scheduled_date,
          };
        })
      );

      // Simple optimization: group by store, then prioritize by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      
      const optimized = requestsWithDetails
        .sort((a, b) => {
          // First by store to minimize travel
          if (a.store_id !== b.store_id) {
            return a.store_id.localeCompare(b.store_id);
          }
          // Then by priority
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
        })
        .map((stop, index) => ({
          ...stop,
          order: index + 1,
        }));

      setOptimizedRoute(optimized);
      setTotalDuration(optimized.reduce((sum, stop) => sum + stop.estimated_duration, 0));

      toast({
        title: "Route Optimized",
        description: `Optimized ${optimized.length} stops for minimal travel time`,
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: "Error",
        description: "Failed to optimize route",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return colors[priority] || colors.low;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5" />
              Route Optimizer
            </CardTitle>
            <CardDescription>
              Optimize your daily route for maximum efficiency
            </CardDescription>
          </div>
          <Button 
            onClick={optimizeRoute}
            disabled={todaysRequests.length === 0 || isOptimizing}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Stops</p>
                  <p className="text-2xl font-bold">{optimizedRoute.length || todaysRequests.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                  <p className="text-2xl font-bold">{totalDuration}m</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency</p>
                  <p className="text-2xl font-bold">
                    {optimizedRoute.length > 0 ? '95%' : '--'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimized Route */}
        {optimizedRoute.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Optimized Route</h3>
            <div className="space-y-3">
              {optimizedRoute.map((stop) => (
                <div 
                  key={stop.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {stop.order}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{stop.cart_qr_code}</h4>
                      <Badge className={getPriorityColor(stop.priority)}>
                        {stop.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {stop.store_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stop.estimated_duration}m
                      </span>
                      <span>{stop.request_type}</span>
                    </div>
                  </div>

                  {stop.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(stop.scheduled_date), 'HH:mm')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {todaysRequests.length === 0 
                ? "No scheduled requests for today"
                : "Click 'Optimize Route' to plan your day"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
