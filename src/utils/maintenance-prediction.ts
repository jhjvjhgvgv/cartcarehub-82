import { Cart, MaintenancePrediction } from "@/types/cart";
import { differenceInDays } from "date-fns";

// Threshold for when to suggest maintenance (in days)
const MAINTENANCE_THRESHOLD_DAYS = 30;

// Weights for different factors
const WEIGHTS = {
  AGE_SINCE_INSPECTION: 0.4,
  ISSUE_COUNT: 0.3,
  HIGH_SEVERITY_ISSUES: 0.3
};

export interface PredictMaintenanceArgs {
  cart: Cart;
  lastInspectedAt?: string | null;
  openIssueCount?: number;
  highSeverityOpenIssueCount?: number;
}

/**
 * Calculate predicted maintenance needs for a cart
 * Returns a MaintenancePrediction object (not a mutated cart)
 */
export function predictMaintenance(args: PredictMaintenanceArgs): MaintenancePrediction {
  const { cart, lastInspectedAt, openIssueCount = 0, highSeverityOpenIssueCount = 0 } = args;
  
  // Skip if cart is already out of service or retired
  if (cart.status === "out_of_service" || cart.status === "retired") {
    return {
      maintenance_probability: 0,
      days_until_maintenance: null
    };
  }

  const now = new Date();
  
  // Factor 1: Age since last inspection
  let ageFactor = 0;
  if (lastInspectedAt) {
    const daysSinceInspection = differenceInDays(now, new Date(lastInspectedAt));
    ageFactor = Math.min(daysSinceInspection / MAINTENANCE_THRESHOLD_DAYS, 1);
  } else {
    // No inspection data - use cart creation date as fallback
    const daysSinceCreation = differenceInDays(now, new Date(cart.created_at));
    ageFactor = Math.min(daysSinceCreation / MAINTENANCE_THRESHOLD_DAYS, 1);
  }
  
  // Factor 2: Issue count (normalized, max 3 issues for 100%)
  const issueFactor = Math.min(openIssueCount / 3, 1);
  
  // Factor 3: High severity issues (normalized, any high severity issue is concerning)
  const severityFactor = Math.min(highSeverityOpenIssueCount / 2, 1);
  
  // Calculate probability (0-1)
  let probability = (
    ageFactor * WEIGHTS.AGE_SINCE_INSPECTION +
    issueFactor * WEIGHTS.ISSUE_COUNT +
    severityFactor * WEIGHTS.HIGH_SEVERITY_ISSUES
  );
  
  // Add some entropy for similar carts
  probability = Math.min(probability + (Math.random() * 0.1 - 0.05), 1);
  probability = Math.max(probability, 0);
  
  // Calculate days until maintenance needed
  // Lower probability = more days until maintenance
  const daysUntilMaintenance = probability > 0.1
    ? Math.max(1, Math.round(MAINTENANCE_THRESHOLD_DAYS * (1 - probability)))
    : null;
  
  return {
    maintenance_probability: probability,
    days_until_maintenance: daysUntilMaintenance
  };
}

/**
 * Calculate predictions for an array of carts with their inspection/issue data
 */
export function calculateMaintenancePredictions(
  cartsWithData: Array<PredictMaintenanceArgs>
): MaintenancePrediction[] {
  return cartsWithData.map(args => predictMaintenance(args));
}
