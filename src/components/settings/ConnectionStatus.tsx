
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Link2, XCircle } from "lucide-react";
import { ConnectionService } from "@/services/ConnectionService";
import { StoreConnection } from "./types";

interface ConnectionStatusProps {
  isMaintenance: boolean;
}

export function ConnectionStatus({ isMaintenance }: ConnectionStatusProps) {
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        let results: StoreConnection[] = [];
        
        if (isMaintenance) {
          // In a real app, this would use the current user's ID
          const maintenanceId = "current-maintenance-email@example.com";
          results = await ConnectionService.getMaintenanceRequests(maintenanceId);
        } else {
          // In a real app, this would use the current store's ID
          const storeId = "store123";
          results = await ConnectionService.getStoreConnections(storeId);
        }
        
        setConnections(results);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [isMaintenance]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "active":
        return "Connected";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return <div>Loading connection status...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {isMaintenance
                ? "No stores have connected to your maintenance service yet."
                : "You haven't connected to any maintenance providers yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  {getStatusIcon(connection.status)}
                  <div>
                    <p className="font-medium">
                      {isMaintenance ? `Store ID: ${connection.storeId}` : `Maintenance: ${connection.maintenanceId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getStatusText(connection.status)}
                      {connection.connectedAt && ` since ${new Date(connection.connectedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                {connection.status === "active" && (
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
