import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { checkProfileCompletion } from "@/services/profile/profile-completion";
import { ConnectionService } from "@/services/ConnectionService";
import { useAuth } from "@/hooks/use-auth";

interface ConnectionStatusHandlerProps {
  children: React.ReactNode;
  showWarnings?: boolean;
}

export const ConnectionStatusHandler: React.FC<ConnectionStatusHandlerProps> = ({ 
  children, 
  showWarnings = true 
}) => {
  const { profile, loading: profileLoading, isStoreUser, isMaintenanceUser } = useUserProfile();
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean;
    hasActiveConnections: boolean;
    error?: string;
  }>({ loading: true, hasActiveConnections: false });
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user?.id || !profile) return;

      try {
        // First check if profile is complete
        const completion = await checkProfileCompletion(user.id);
        setProfileComplete(completion.isComplete);

        // Only check connections if profile is complete
        if (completion.isComplete) {
          if (isStoreUser) {
            // For store users, check if they have any accepted connections
            const connections = await ConnectionService.getStoreConnections(profile.company_name || 'unknown');
            const activeConnections = connections.filter(conn => conn.status === 'active');
            setConnectionStatus({ 
              loading: false, 
              hasActiveConnections: activeConnections.length > 0 
            });
          } else if (isMaintenanceUser) {
            // For maintenance users, check if they have any accepted connections
            const requests = await ConnectionService.getMaintenanceRequests(user.id);
            const activeConnections = requests.filter(req => req.status === 'active');
            setConnectionStatus({ 
              loading: false, 
              hasActiveConnections: activeConnections.length > 0 
            });
          } else {
            setConnectionStatus({ loading: false, hasActiveConnections: true }); // Other roles don't need connections
          }
        } else {
          setConnectionStatus({ loading: false, hasActiveConnections: true }); // Don't show warnings for incomplete profiles
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
        setConnectionStatus({ 
          loading: false, 
          hasActiveConnections: false, 
          error: "Failed to check connection status" 
        });
      }
    };

    if (!profileLoading) {
      checkConnectionStatus();
    }
  }, [user?.id, profile, profileLoading, isStoreUser, isMaintenanceUser]);

  const getConnectionStatusBadge = () => {
    if (connectionStatus.loading) {
      return (
        <Badge variant="secondary" className="gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking connections...
        </Badge>
      );
    }

    if (profileComplete === false) {
      return (
        <Badge variant="outline" className="gap-2">
          <Clock className="h-3 w-3" />
          Profile setup required
        </Badge>
      );
    }

    if (connectionStatus.error) {
      return (
        <Badge variant="destructive" className="gap-2">
          <XCircle className="h-3 w-3" />
          Connection error
        </Badge>
      );
    }

    if (connectionStatus.hasActiveConnections) {
      return (
        <Badge variant="default" className="gap-2">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-2">
        <AlertTriangle className="h-3 w-3" />
        No active connections
      </Badge>
    );
  };

  const shouldShowWarning = showWarnings && 
    profileComplete === true && 
    !connectionStatus.loading && 
    !connectionStatus.hasActiveConnections && 
    !connectionStatus.error;

  return (
    <div className="space-y-4">
      {/* Connection Status Badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Connection Status:</span>
          {getConnectionStatusBadge()}
        </div>
      </div>

      {/* Warning for users without active connections */}
      {shouldShowWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isStoreUser && (
              <>
                You don't have any active maintenance provider connections. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm underline ml-1"
                  onClick={() => window.location.href = '/settings'}
                >
                  Connect with maintenance providers
                </Button> to access full features.
              </>
            )}
            {isMaintenanceUser && (
              <>
                You don't have any active store connections. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm underline ml-1"
                  onClick={() => window.location.href = '/settings'}
                >
                  Connect with stores
                </Button> to start receiving maintenance requests.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
};