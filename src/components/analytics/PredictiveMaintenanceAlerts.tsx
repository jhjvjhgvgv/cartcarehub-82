import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Wrench, Calendar, Sparkles } from "lucide-react";
import { useAllCartsPredictive, useTriggerAutoSchedule } from "@/hooks/use-predictive-maintenance";
import { Skeleton } from "@/components/ui/skeleton";
import { CartWithPrediction } from "@/types/cart";

export function PredictiveMaintenanceAlerts() {
  const { data: predictions, isLoading } = useAllCartsPredictive();
  const triggerAutoSchedule = useTriggerAutoSchedule();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const highRiskCarts = predictions?.filter((p: CartWithPrediction) => 
    p.prediction && (p.prediction.risk_level === 'high' || p.prediction.risk_level === 'critical')
  ) || [];

  const mediumRiskCarts = predictions?.filter((p: CartWithPrediction) => 
    p.prediction && p.prediction.risk_level === 'medium'
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Maintenance Alerts</CardTitle>
          <CardDescription>AI-powered maintenance predictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Predictive Maintenance Alerts
            </CardTitle>
            <CardDescription>AI-powered maintenance predictions based on usage patterns</CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => triggerAutoSchedule.mutate()}
            disabled={triggerAutoSchedule.isPending}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Auto-Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {highRiskCarts.length === 0 && mediumRiskCarts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>All carts are in good condition</p>
            <p className="text-sm">No high-risk maintenance alerts at this time</p>
          </div>
        ) : (
          <>
            {/* High Risk Alerts */}
            {highRiskCarts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  High Priority Alerts ({highRiskCarts.length})
                </div>
                {highRiskCarts.map((cart: CartWithPrediction) => (
                  <div
                    key={cart.id}
                    className="border-l-4 border-destructive bg-destructive/5 p-4 rounded-r-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold font-mono">{cart.qr_token}</span>
                          {cart.prediction && (
                            <Badge variant={getRiskColor(cart.prediction.risk_level)}>
                              {getRiskIcon(cart.prediction.risk_level)}
                              <span className="ml-1">{cart.prediction.risk_level.toUpperCase()}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Store: {cart.store_org_id} • Risk Score: {cart.prediction?.risk_score}/100
                        </div>
                      </div>
                    </div>
                    
                    {cart.prediction && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Usage:</span> {cart.prediction.metrics.total_usage_hours.toFixed(1)}h
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issues:</span> {cart.prediction.metrics.total_issues}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Downtime:</span> {cart.prediction.metrics.avg_downtime.toFixed(0)}min avg
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Service:</span>{' '}
                            {cart.prediction.metrics.days_since_maintenance 
                              ? `${cart.prediction.metrics.days_since_maintenance}d ago`
                              : 'Never'}
                          </div>
                        </div>

                        {cart.prediction.ai_prediction && (
                          <div className="text-xs bg-background/50 p-2 rounded border">
                            <div className="font-medium mb-1">AI Analysis:</div>
                            <div className="text-muted-foreground line-clamp-3">
                              {cart.prediction.ai_prediction}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Medium Risk Alerts */}
            {mediumRiskCarts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  Monitor Closely ({mediumRiskCarts.length})
                </div>
                {mediumRiskCarts.map((cart: CartWithPrediction) => (
                  <div
                    key={cart.id}
                    className="border-l-4 border-primary bg-primary/5 p-3 rounded-r-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{cart.qr_token}</span>
                        {cart.prediction && (
                          <Badge variant="outline">
                            Risk Score: {cart.prediction.risk_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {cart.prediction && (
                      <div className="text-xs text-muted-foreground">
                        {cart.prediction.metrics.total_usage_hours.toFixed(1)}h usage • {cart.prediction.metrics.total_issues} issues
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
