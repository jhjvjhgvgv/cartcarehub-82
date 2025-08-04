
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ConnectionService } from "@/services/ConnectionService";
import { Store, StoreConnection } from "./types";

interface ConnectionRequestsDialogProps {
  isMaintenance: boolean;
  store?: Store;
}

export function ConnectionRequestsDialog({ isMaintenance, store }: ConnectionRequestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<StoreConnection[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // For maintenance providers, fetch any pending connection requests
  useEffect(() => {
    if (isOpen && isMaintenance && user) {
      const fetchRequests = async () => {
        try {
          const requests = await ConnectionService.getMaintenanceRequests(user.id);
          setPendingRequests(requests.filter(req => req.status === "pending"));
        } catch (error) {
          console.error("Error fetching maintenance requests:", error);
        }
      };
      
      fetchRequests();
    }
  }, [isOpen, isMaintenance, user]);

  const handleRequestConnection = async () => {
    if (!store) return;
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address format",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await ConnectionService.requestConnectionByEmail(store.id, email.trim());
      
      if (result.success) {
        toast({
          title: "Request Sent",
          description: result.message,
        });
        setEmail("");
        setIsOpen(false);
      } else {
        toast({
          title: "Request Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection request error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const success = await ConnectionService.acceptConnection(connectionId);
      
      if (success) {
        setPendingRequests(requests => requests.filter(req => req.id !== connectionId));
        toast({
          title: "Connection Accepted",
          description: "You've successfully connected with the store",
        });
      }
    } catch (error) {
      console.error("Failed to accept connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept the connection",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const success = await ConnectionService.rejectConnection(connectionId);
      
      if (success) {
        setPendingRequests(requests => requests.filter(req => req.id !== connectionId));
        toast({
          title: "Connection Rejected",
          description: "Connection request has been rejected",
        });
      }
    } catch (error) {
      console.error("Failed to reject connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject the connection",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {isMaintenance ? "View Connection Requests" : "Connect to Maintenance Provider"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isMaintenance 
              ? "Store Connection Requests" 
              : "Connect to Maintenance Provider"}
          </DialogTitle>
        </DialogHeader>
        
        {isMaintenance ? (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending connection requests
              </p>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} className="p-4 border rounded-md">
                  <p className="font-medium mb-2">Store ID: {request.storeId}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Requested: {new Date(request.requestedAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maintenance Provider Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maintenance@example.com"
              />
            </div>
            <Button 
              onClick={handleRequestConnection}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Sending request..." : "Send Connection Request"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
