import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cart } from "@/types/cart";
import { CartQRCode } from "./CartQRCode";
import { CartPredictionBadge } from "./CartPredictionBadge";
import { CartAIRecommendations } from "./CartAIRecommendations";

interface CartDetailViewProps {
  cart: Cart;
  onEdit: () => void;
}

export function CartDetailView({ cart, onEdit }: CartDetailViewProps) {
  // Function to format the date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Card details */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">QR Code:</span>
                  <span>{cart.qr_code || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Store:</span>
                  <span>{cart.store || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span>{cart.status || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Last Maintenance:</span>
                  <span>{formatDate(cart.lastMaintenance)}</span>
                </div>
                {cart.maintenancePrediction && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Maintenance Prediction:</span>
                    <CartPredictionBadge
                      probability={cart.maintenancePrediction?.probability}
                      daysUntilMaintenance={cart.maintenancePrediction?.daysUntilMaintenance}
                    />
                  </div>
                )}
                {cart.issues && cart.issues.length > 0 && (
                  <div>
                    <span className="font-semibold">Issues:</span>
                    <ul>
                      {cart.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance history if available */}
          {cart.maintenance_history && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {Array.isArray(cart.maintenance_history) ? (
                    cart.maintenance_history.map((history, index) => (
                      <li key={index}>
                        {history.date}: {history.description}
                      </li>
                    ))
                  ) : (
                    <li>No maintenance history available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* QR Code */}
          <CartQRCode cart={cart} />
          
          {/* AI Recommendations */}
          <CartAIRecommendations cart={cart} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onEdit}>Edit Cart</Button>
      </div>
    </div>
  );
}
