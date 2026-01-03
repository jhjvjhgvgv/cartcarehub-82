import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/hooks/use-auth";
import { ConnectionService } from "@/services/ConnectionService";
import { StoreConnection } from "@/services/connection/types";
import { generateStoreId } from "@/utils/store-id-utils";
import { 
  Plus, 
  Building, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Mail
} from "lucide-react";
import { clearNewAccountFlags } from "@/services/connection/storage-utils";

export const ImprovedConnectionsManager = () => {
  const { profile, isMaintenanceUser, isStoreUser } = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StoreConnection[]>([]);
  const [availableOptions, setAvailableOptions] = useState<{ id: string; name: string }[]>([]);
  const [newConnectionEmail, setNewConnectionEmail] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadConnectionData();
  }, [user?.id, profile]);

  const loadConnectionData = async () => {
    if (!user?.id || !profile) {
      console.log('ImprovedConnectionsManager: Missing user or profile', { userId: user?.id, profile });
      return;
    }
    
    console.log('ImprovedConnectionsManager: Loading connection data', { 
      userId: user.id, 
      isMaintenanceUser, 
      isStoreUser,
      profileCompanyName: profile?.company_name 
    });

    try {
      setLoading(true);
      
      if (isMaintenanceUser) {
        console.log('ImprovedConnectionsManager: Loading data for maintenance user');
        // Load maintenance provider connections and available stores
        const requests = await ConnectionService.getMaintenanceRequests(user.id);
        console.log('ImprovedConnectionsManager: Maintenance requests loaded', requests);
        const activeConnections = requests.filter(req => req.status === 'active');
        const pending = requests.filter(req => req.status === 'pending');
        
        setConnections(activeConnections);
        setPendingRequests(pending);
        const storesPromise = ConnectionService.getStores();
        storesPromise.then(stores => {
          console.log('ImprovedConnectionsManager: Available stores', stores);
          setAvailableOptions(stores);
        });
        // Already handled above
      } else if (isStoreUser) {
        console.log('ImprovedConnectionsManager: Loading data for store user');
        // Load store connections and available maintenance providers
        const storeConnections = await ConnectionService.getStoreConnections(profile.company_name || 'unknown');
        console.log('ImprovedConnectionsManager: Store connections loaded', storeConnections);
        const activeConnections = storeConnections.filter(conn => conn.status === 'active');
        const pending = storeConnections.filter(conn => conn.status === 'pending');
        
        setConnections(activeConnections);
        setPendingRequests(pending);
        
        const providers = await ConnectionService.getMaintenanceProviders();
        console.log('ImprovedConnectionsManager: Available providers', providers);
        setAvailableOptions(providers);
      }
    } catch (error) {
      console.error("ImprovedConnectionsManager: Error loading connection data:", error);
      toast({
        title: "Error",
        description: "Failed to load connection data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = async () => {
    if (!newConnectionEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    console.log('ImprovedConnectionsManager: Creating connection', { 
      email: newConnectionEmail, 
      isMaintenanceUser, 
      isStoreUser,
      userCompany: profile?.company_name 
    });

    setIsConnecting(true);
    try {
      if (isMaintenanceUser) {
        // For maintenance users, connect to store by email
        console.log('ImprovedConnectionsManager: Requesting connection as maintenance user');
        const storeId = newConnectionEmail.split('@')[1] || `store-${Date.now()}`;
        
        try {
          const { DatabaseConnectionService } = await import("@/services/connection/database-connection-service");
          
          // Get maintenance provider ID from profile using user ID instead of email
          const provider = await DatabaseConnectionService.getMaintenanceProviderByUserId(profile?.id || "");
          if (!provider) {
            toast({
              title: "Provider not found",
              description: "Your maintenance provider profile could not be found. Please complete your profile setup.",
              variant: "destructive"
            });
            return;
          }

          const success = await DatabaseConnectionService.requestConnection(storeId, provider.id);
          
          if (success) {
            toast({
              title: "Connection request sent",
              description: `Request sent to store: ${storeId}`
            });
            setNewConnectionEmail("");
            // Refresh connections if there's a callback
            loadConnectionData();
          } else {
            toast({
              title: "Request failed",
              description: "Failed to send connection request or connection already exists",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error sending connection request:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive"
          });
        }
      } else if (isStoreUser) {
        // For store users, connect to maintenance provider by email
        console.log('ImprovedConnectionsManager: Requesting connection as store user');
        
        try {
          const { DatabaseConnectionService } = await import("@/services/connection/database-connection-service");
          const storeId = generateStoreId(profile);
          console.log('ImprovedConnectionsManager: Using store ID:', storeId, 'for profile:', profile);
          const result = await DatabaseConnectionService.requestConnectionByEmail(storeId, newConnectionEmail);
          
          if (result.success) {
            toast({
              title: "Connection request sent",
              description: result.message
            });
            setNewConnectionEmail("");
            loadConnectionData();
          } else {
            toast({
              title: "Request failed",
              description: result.message,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error sending connection request:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive"
          });
        }
      } else {
        console.log('ImprovedConnectionsManager: User role not recognized', { isMaintenanceUser, isStoreUser });
        toast({
          title: "Error",
          description: "Unable to determine user type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ImprovedConnectionsManager: Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const success = await ConnectionService.acceptConnection(connectionId);
      if (success) {
        toast({
          title: "Connection Accepted",
          description: "Connection request has been accepted",
        });
        // Clear new account flags since user has established their first connection
        clearNewAccountFlags(true);
        await loadConnectionData();
      } else {
        throw new Error("Failed to accept connection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept connection request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const success = await ConnectionService.rejectConnection(connectionId);
      if (success) {
        toast({
          title: "Connection Rejected",
          description: "Connection request has been rejected",
        });
        await loadConnectionData();
      } else {
        throw new Error("Failed to reject connection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject connection request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading connections...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isMaintenanceUser ? "Connect with Stores" : "Connect with Maintenance Providers"}
          </CardTitle>
          <CardDescription>
            {isMaintenanceUser 
              ? "Request connections with stores to start receiving maintenance requests"
              : "Connect with maintenance providers to get help with cart maintenance"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="connection-email">
                {isMaintenanceUser ? "Store Manager Email" : "Maintenance Provider Email"}
              </Label>
              <Input
                id="connection-email"
                type="email"
                placeholder="Enter email address"
                value={newConnectionEmail}
                onChange={(e) => setNewConnectionEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateConnection}
                disabled={isConnecting || !newConnectionEmail.trim()}
                className="gap-2"
              >
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Mail className="h-4 w-4" />
                Send Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              {isMaintenanceUser 
                ? "Connection requests from stores waiting for your response"
                : "Connection requests sent to maintenance providers"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Store ID: {request.storeId}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {isMaintenanceUser && request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAcceptRequest(request.id)}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Connections ({connections.length})
          </CardTitle>
          <CardDescription>
            {isMaintenanceUser 
              ? "Stores you're providing maintenance services for"
              : "Maintenance providers helping with your cart maintenance"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active connections yet. Send connection requests to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {isMaintenanceUser ? `Store: ${connection.storeId}` : `Provider: ${connection.maintenanceId}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Connected {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(connection.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};