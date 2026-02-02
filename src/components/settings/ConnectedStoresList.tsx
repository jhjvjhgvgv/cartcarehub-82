import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Settings, CheckCircle, Clock, XCircle, Eye, Loader2, Wifi, WifiOff, Users } from "lucide-react";
import { DatabaseConnectionService } from "@/services/connection/database-connection-service";
import { StoreConnection } from "@/services/connection/types";
import { ConnectionRequestsDialog } from "./ConnectionRequestsDialog";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useNavigate } from "react-router-dom";
import { StoreForm } from "./store/StoreForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRealtimeConnections } from "@/hooks/use-realtime-connections";
import { getConnectionStatusInfo } from "@/utils/connection-display-utils";
import { useToast } from "@/hooks/use-toast";

interface ConnectedStoresListProps {
  isMaintenance: boolean;
  formatDate: (dateString: string) => string;
}

export function ConnectedStoresList({ isMaintenance, formatDate }: ConnectedStoresListProps) {
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState<any>(null);
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadConnections = useCallback(async () => {
    if (!profile?.org_id) return;
    
    setLoading(true);
    try {
      let connectionData: StoreConnection[] = [];
      
      if (isMaintenance) {
        // For maintenance users, get their provider org's connected stores
        connectionData = await DatabaseConnectionService.getMaintenanceRequests(profile.org_id);
      } else {
        // For store users, get their store org's connected providers
        connectionData = await DatabaseConnectionService.getStoreConnections(profile.org_id);
      }
      
      setConnections(connectionData);
    } catch (error) {
      console.error("Error loading connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, isMaintenance, toast]);

  const { isConnected: realtimeConnected } = useRealtimeConnections(loadConnections);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleViewDetails = (storeId: string, storeName: string) => {
    navigate(`/store/${storeId}`, { state: { storeName } });
  };

  const getStatusIcon = (status: string) => {
    const statusInfo = getConnectionStatusInfo(status);
    switch (status) {
      case 'pending':
        return <Clock className={`h-4 w-4 ${statusInfo.color}`} />;
      case 'accepted':
      case 'active':
        return <CheckCircle className={`h-4 w-4 ${statusInfo.color}`} />;
      case 'rejected':
        return <XCircle className={`h-4 w-4 ${statusInfo.color}`} />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusInfo = getConnectionStatusInfo(status);
    return statusInfo.label;
  };

  if (loading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {isMaintenance ? "Connected Stores" : "Connected Providers"}
              <span className="bg-muted px-2 py-1 rounded text-xs">
                {connections.filter(c => c.status === 'active').length}
              </span>
            </h3>
            <div className="flex items-center gap-1">
              {realtimeConnected ? (
                <div className="flex items-center gap-1" title="Real-time updates active">
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <div className="flex items-center gap-1" title="Real-time updates inactive">
                  <WifiOff className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          {isMaintenance && (
            <ConnectionRequestsDialog isMaintenance={true} onUpdate={loadConnections} />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isMaintenance ? "Store" : "Provider"}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {isMaintenance 
                              ? (connection.storeName || 'Unknown Store')
                              : (connection.providerName || 'Unknown Provider')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {(isMaintenance ? connection.storeId : connection.maintenanceId).slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        <Badge variant={getConnectionStatusInfo(connection.status).variant}>
                          {getStatusLabel(connection.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(connection.connectedAt || connection.requestedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isMaintenance && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(connection.storeId, connection.storeId)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Store
                          </Button>
                        )}
                        {!isMaintenance && connection.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Provider Details",
                                description: "Provider management features coming soon!"
                              });
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-12 w-12 text-muted-foreground/30" />
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground">
                          No {isMaintenance ? "stores" : "maintenance providers"} connected yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isMaintenance 
                            ? "Start by requesting connections with stores to receive maintenance requests"
                            : "Connect with maintenance providers to get your shopping carts serviced"
                          }
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
                          {realtimeConnected ? (
                            <>
                              <Wifi className="h-3 w-3 text-green-500" />
                              Real-time updates active
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3 text-gray-400" />
                              Real-time updates inactive
                            </>
                          )}
                        </div>
                      </div>
                      {!isMaintenance && (
                        <ConnectionRequestsDialog 
                          isMaintenance={false} 
                          store={{
                            id: profile?.company_name || "your-store",
                            name: profile?.company_name || "Your Store",
                            status: "active",
                            connectedSince: new Date().toISOString()
                          }} 
                          onUpdate={loadConnections}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={editingStore !== null} onOpenChange={(open) => !open && setEditingStore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {editingStore && (
            <StoreForm
              initialData={editingStore}
              onSubmit={(data) => {
                toast({
                  title: "Store updated",
                  description: `Successfully updated ${data.name}`
                });
                setEditingStore(null);
              }}
              onCancel={() => setEditingStore(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}