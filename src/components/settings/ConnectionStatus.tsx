import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Link2, RefreshCw, XCircle } from "lucide-react";
import { ConnectionService } from "@/services/ConnectionService";
import { StoreConnection } from "./types";
import { useUserProfile } from "@/hooks/use-user-profile";

interface ConnectionStatusProps {
  isMaintenance: boolean;
}

export function ConnectionStatus({ isMaintenance }: ConnectionStatusProps) {
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nameCache, setNameCache] = useState<Record<string, string>>({});
  const { profile } = useUserProfile();
  const currentUserId = profile?.id || '';

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        let results: StoreConnection[] = [];
        
        if (isMaintenance) {
          results = await ConnectionService.getMaintenanceRequests(currentUserId);
        } else {
          results = await ConnectionService.getStoreConnections(currentUserId);
        }
        
        // Build name cache for all connections
        const newCache: Record<string, string> = {};
        for (const conn of results) {
          if (isMaintenance && conn.storeId) {
            const store = await ConnectionService.getStoreById(conn.storeId);
            newCache[conn.storeId] = store?.name || conn.storeId;
          } else if (!isMaintenance && conn.maintenanceId) {
            const provider = await ConnectionService.getMaintenanceById(conn.maintenanceId);
            newCache[conn.maintenanceId] = provider?.name || conn.maintenanceId;
          }
        }
        setNameCache(newCache);
        setConnections(results);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [isMaintenance, refreshKey, currentUserId]);

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

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Helper to get name from cache
  const getNameFromId = (id: string) => {
    return nameCache[id] || id;
  };

  const handleAcceptConnection = async (connectionId: string) => {
    const success = await ConnectionService.acceptConnection(connectionId);
    if (success) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    const success = await ConnectionService.rejectConnection(connectionId);
    if (success) {
      setRefreshKey(prev => prev + 1);
    }
  };

  if (loading) {
    return <div>Loading connection status...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connection Status
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
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
                      {isMaintenance 
                        ? getNameFromId(connection.storeId)
                        : getNameFromId(connection.maintenanceId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getStatusText(connection.status)}
                      {connection.connectedAt && ` since ${new Date(connection.connectedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                {connection.status === "pending" && (
                  <div className="flex gap-2">
                    {!isMaintenance && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAcceptConnection(connection.id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive" 
                          onClick={() => handleRejectConnection(connection.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
                
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
