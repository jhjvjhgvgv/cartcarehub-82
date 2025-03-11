
import { Cart } from "@/types/cart";
import { differenceInDays, addDays, parseISO } from "date-fns";

// Threshold for when to suggest maintenance (in days)
const MAINTENANCE_THRESHOLD_DAYS = 30;

// Weights for different factors
const WEIGHTS = {
  AGE_SINCE_MAINTENANCE: 0.4,
  ISSUE_COUNT: 0.3,
  STATUS_HISTORY: 0.3
};

/**
 * Calculate predicted maintenance needs for a cart
 */
export function calculateMaintenancePrediction(cart: Cart): Cart {
  // Skip if cart is already in maintenance
  if (cart.status === "maintenance" || cart.status === "retired") {
    return cart;
  }

  const lastMaintenance = cart.lastMaintenance || cart.last_maintenance || new Date().toISOString();
  const lastMaintenanceDate = parseISO(lastMaintenance);
  const now = new Date();
  
  // Factor 1: Age since last maintenance
  const daysSinceLastMaintenance = differenceInDays(now, lastMaintenanceDate);
  let ageFactor = Math.min(daysSinceLastMaintenance / MAINTENANCE_THRESHOLD_DAYS, 1);
  
  // Factor 2: Issue count
  const issueCount = cart.issues.length;
  const issueFactor = Math.min(issueCount / 3, 1); // Normalize, max 3 issues for 100%
  
  // Calculate probability (0-1)
  let probability = (
    ageFactor * WEIGHTS.AGE_SINCE_MAINTENANCE +
    issueFactor * WEIGHTS.ISSUE_COUNT
  );
  
  // Add some entropy for similar carts
  probability = Math.min(probability + (Math.random() * 0.1 - 0.05), 1);
  probability = Math.max(probability, 0);
  
  // Calculate days until maintenance needed
  // Lower probability = more days until maintenance
  const daysUntilMaintenance = Math.max(
    1,
    Math.round(MAINTENANCE_THRESHOLD_DAYS * (1 - probability))
  );
  
  return {
    ...cart,
    maintenancePrediction: {
      probability,
      daysUntilMaintenance,
      lastCalculated: now.toISOString()
    }
  };
}

/**
 * Process an array of carts and add prediction data
 */
export function addMaintenancePredictions(carts: Cart[]): Cart[] {
  return carts.map(cart => calculateMaintenancePrediction(cart));
}
