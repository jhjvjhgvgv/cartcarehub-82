import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cart, CartWithStore, getStatusLabel } from "@/types/cart";
import { CartQRCode } from "./CartQRCode";
import { CartStatusBadge } from "./CartStatusBadge";
import { MapPin, ShoppingCart, FileText, Tag, Clock } from "lucide-react";

interface CartDetailViewProps {
  cart: Cart | CartWithStore;
  onEdit: () => void;
}

export function CartDetailView({ cart, onEdit }: CartDetailViewProps) {
  // Function to format the date
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get background gradient based on cart status
  const getCardBackground = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "bg-gradient-to-br from-background to-green-50 dark:to-green-950/20";
      case "out_of_service":
        return "bg-gradient-to-br from-background to-yellow-50 dark:to-yellow-950/20";
      case "retired":
        return "bg-gradient-to-br from-background to-red-50 dark:to-red-950/20";
    }
  };

  const getBorderColor = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "border-t-green-500";
      case "out_of_service":
        return "border-t-yellow-500";
      case "retired":
        return "border-t-red-500";
    }
  };

  const getIconColor = (status: Cart["status"]) => {
    switch (status) {
      case "in_service":
        return "text-green-500";
      case "out_of_service":
        return "text-yellow-500";
      case "retired":
        return "text-red-500";
    }
  };

  // Get store name from CartWithStore if available
  const storeName = 'store_name' in cart ? cart.store_name : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          {/* Card details */}
          <Card className={`${getCardBackground(cart.status)} border-t-4 ${getBorderColor(cart.status)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  <div className="flex items-center">
                    <ShoppingCart className={`h-6 w-6 mr-2 ${getIconColor(cart.status)}`} />
                    Cart Details
                  </div>
                </CardTitle>
                <CartStatusBadge status={cart.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-full">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800 dark:text-blue-300">QR Token:</span>
                    <span className="ml-2 font-mono">{cart.qr_token || "N/A"}</span>
                  </div>
                </div>
                
                {cart.asset_tag && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-full">
                      <Tag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-green-800 dark:text-green-300">Asset Tag:</span>
                      <span className="ml-2">{cart.asset_tag}</span>
                    </div>
                  </div>
                )}

                {storeName && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-800 dark:text-indigo-300">Store:</span>
                      <span className="ml-2">{storeName}</span>
                    </div>
                  </div>
                )}

                {cart.model && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-full">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-purple-800 dark:text-purple-300">Model:</span>
                      <span className="ml-2">{cart.model}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-full">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-orange-800 dark:text-orange-300">Last Updated:</span>
                    <span className="ml-2">{formatDate(cart.updated_at)}</span>
                  </div>
                </div>

                {cart.notes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <span className="font-semibold">Notes:</span>
                    <p className="mt-1 text-muted-foreground">{cart.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* QR Code */}
          <CartQRCode cart={cart} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onEdit} className="px-5 py-2.5 bg-primary hover:bg-primary/90 transition-colors">
          Edit Cart
        </Button>
      </div>
    </div>
  );
}
