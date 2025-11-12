import { useState } from 'react';
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
  AlertCircle
} from "lucide-react";

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

interface StoreCluster {
  store_id: string;
  store_name: string;
  stops: RouteStop[];
  total_duration: number;
  priority_score: number;
}

export function RouteOptimizer() {
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([]);
  const [clusters, setClusters] = useState<StoreCluster[]>([]);
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
            order: 0 // Will be assigned during optimization
          };
        })
      );

      // Advanced optimization: cluster by store, then prioritize
      const storeGroups = requestsWithDetails.reduce((acc, stop) => {
        if (!acc[stop.store_id]) {
          acc[stop.store_id] = {
            store_id: stop.store_id,
            store_name: stop.store_name,
            stops: [],
            total_duration: 0,
            priority_score: 0
          };
        }
        acc[stop.store_id].stops.push(stop);
        acc[stop.store_id].total_duration += stop.estimated_duration;
        
        // Priority scoring
        const priorityValue = stop.priority === 'high' ? 3 : stop.priority === 'medium' ? 2 : 1;
        acc[stop.store_id].priority_score += priorityValue;
        
        return acc;
      }, {} as Record<string, StoreCluster>);

      const clustersArray = Object.values(storeGroups);
      clustersArray.sort((a, b) => b.priority_score - a.priority_score);

      const priorityOrder = { high: 1, medium: 2, low: 3 };
      clustersArray.forEach(cluster => {
        cluster.stops.sort((a, b) => 
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
        );
      });

      setClusters(clustersArray);

      const optimized = clustersArray.flatMap((cluster, clusterIdx) => 
        cluster.stops.map((stop, stopIdx) => ({
          ...stop,
          order: clusterIdx * 100 + stopIdx + 1
        }))
      );

      setOptimizedRoute(optimized);
      setTotalDuration(optimized.reduce((sum, stop) => sum + stop.estimated_duration, 0));

      toast({
        title: "Route Optimized",
        description: `Optimized ${optimized.length} stops across ${clustersArray.length} locations`,
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
              Intelligent Route Optimizer
            </CardTitle>
            <CardDescription>
              AI-optimized route by priority & location clustering
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
                  <p className="text-sm text-muted-foreground">Locations</p>
                  <p className="text-2xl font-bold">{clusters.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimized Route */}
        {optimizedRoute.length > 0 ? (
          <div className="space-y-4">
            {clusters.map((cluster, clusterIndex) => (
              <div key={cluster.store_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {clusterIndex + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{cluster.store_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cluster.stops.length} stop{cluster.stops.length !== 1 ? 's' : ''} • {cluster.total_duration} min
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Cluster</Badge>
                </div>

                <div className="space-y-2 ml-10">
                  {cluster.stops.map((stop, stopIndex) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {String.fromCharCode(65 + stopIndex)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{stop.cart_qr_code}</span>
                          <Badge className={getPriorityColor(stop.priority)}>
                            {stop.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{stop.estimated_duration} min</span>
                          <span className="capitalize">{stop.request_type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
