
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface CartPredictionBadgeProps {
  probability: number;
  daysUntilMaintenance: number;
}

export function CartPredictionBadge({ probability, daysUntilMaintenance }: CartPredictionBadgeProps) {
  // Format probability as percentage
  const riskPercentage = Math.round(probability * 100);
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  if (probability > 0.7) {
    riskLevel = "high";
  } else if (probability > 0.3) {
    riskLevel = "medium";
  }

  // Determine badge appearance based on risk level
  const badgeVariant = 
    riskLevel === "high" ? "destructive" :
    riskLevel === "medium" ? "warning" : "outline";
    
  const icon = 
    riskLevel === "high" ? <AlertTriangle className="h-3 w-3 mr-1" /> :
    riskLevel === "medium" ? <AlertCircle className="h-3 w-3 mr-1" /> :
    <CheckCircle className="h-3 w-3 mr-1" />;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className="flex items-center gap-1">
            {icon}
            {riskLevel === "high" ? "High Risk" : 
             riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-sm">
            <p className="font-semibold">Maintenance Prediction</p>
            <p>{riskPercentage}% risk of needing repairs</p>
            <p>Estimated time: {daysUntilMaintenance} days</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
