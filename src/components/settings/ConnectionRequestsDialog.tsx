import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Users, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseConnectionService } from "@/services/connection/database-connection-service";
import { useUserProfile } from "@/hooks/use-user-profile";
import { StoreConnection } from "@/services/connection/types";

interface ConnectionRequestsDialogProps {
  isMaintenance: boolean;
  /** Kept for backwards-compat with call sites; not used internally. */
  store?: unknown;
  onUpdate?: () => void;
}

export function ConnectionRequestsDialog({
  isMaintenance,
  onUpdate,
}: ConnectionRequestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  const loadPendingRequests = useCallback(async () => {
    if (!profile?.org_id) {
      setPendingRequests([]);
      return;
    }
    setLoading(true);
    try {
      const rows = isMaintenance
        ? await DatabaseConnectionService.getMaintenanceRequests(profile.org_id)
        : await DatabaseConnectionService.getStoreConnections(profile.org_id);
      setPendingRequests(rows.filter((r) => r.status === "pending"));
    } catch (error) {
      console.error("Error loading pending requests:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, isMaintenance]);

  useEffect(() => {
    if (isOpen) loadPendingRequests();
  }, [isOpen, loadPendingRequests]);

  const handleAcceptRequest = async (connectionId: string) => {
    const success = await DatabaseConnectionService.acceptConnection(connectionId);
    if (success) {
      toast({ title: "Connection accepted" });
      await loadPendingRequests();
      onUpdate?.();
    } else {
      toast({
        title: "Failed to accept",
        description: "Could not accept the connection request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    const success = await DatabaseConnectionService.rejectConnection(connectionId);
    if (success) {
      toast({ title: "Connection rejected" });
      await loadPendingRequests();
      onUpdate?.();
    } else {
      toast({
        title: "Failed to reject",
        description: "Could not reject the connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isMaintenance ? "Store Connection Requests" : "Provider Connection Requests"}
          </DialogTitle>
          <DialogDescription>
            {isMaintenance
              ? "Stores that have requested to connect with your organization"
              : "Providers with pending connection requests"}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isMaintenance ? "Store" : "Provider"}</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {isMaintenance
                            ? request.storeName || request.storeId.slice(0, 8)
                            : request.providerName || request.maintenanceId.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
