
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cart } from "@/types/cart";
import { CartQRCode } from "./CartQRCode";
import { CartPredictionBadge } from "./CartPredictionBadge";
import { CartAIRecommendations } from "./CartAIRecommendations";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CartStatusBadge } from "./CartStatusBadge";
import { Calendar, MapPin, ShoppingCart, History, AlertTriangle } from "lucide-react";

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

  // Get background gradient based on cart status
  const getCardBackground = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-br from-white to-green-50";
      case "maintenance":
        return "bg-gradient-to-br from-white to-yellow-50";
      case "retired":
        return "bg-gradient-to-br from-white to-red-50";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          {/* Card details */}
          <Card className={`${getCardBackground(cart.status)} border-t-4 ${
            cart.status === 'active' ? 'border-t-green-500' : 
            cart.status === 'maintenance' ? 'border-t-yellow-500' : 
            'border-t-red-500'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  <div className="flex items-center">
                    <ShoppingCart className={`h-6 w-6 mr-2 ${
                      cart.status === 'active' ? 'text-green-500' : 
                      cart.status === 'maintenance' ? 'text-yellow-500' : 
                      'text-red-500'
                    }`} />
                    Cart Details
                  </div>
                </CardTitle>
                <CartStatusBadge status={cart.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">QR Code:</span>
                    <span className="ml-2">{cart.qr_code || "N/A"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-full">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Store:</span>
                    <span className="ml-2">{cart.store || "N/A"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-full">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-purple-800">Last Maintenance:</span>
                    <span className="ml-2">{formatDate(cart.lastMaintenance)}</span>
                  </div>
                </div>
                
                {cart.maintenancePrediction && (
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Maintenance Prediction:</span>
                    <CartPredictionBadge
                      probability={cart.maintenancePrediction?.probability}
                      daysUntilMaintenance={cart.maintenancePrediction?.daysUntilMaintenance}
                    />
                  </div>
                )}
                
                {cart.issues && cart.issues.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-red-700">Issues:</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-red-600">
                      {cart.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance history */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2 text-primary-600" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.maintenance_history && cart.maintenance_history.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-primary-50">
                      <TableRow>
                        <TableHead className="text-primary-700">Date</TableHead>
                        <TableHead className="text-primary-700">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.maintenance_history.map((record, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                          <TableCell>{record.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                  No maintenance history available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* QR Code */}
          <CartQRCode cart={cart} />
          
          {/* AI Recommendations */}
          <CartAIRecommendations cart={cart} />
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
