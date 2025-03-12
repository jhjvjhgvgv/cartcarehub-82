import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/connection"; // Updated import path

export default function Invite() {
  const [searchParams] = useSearchParams();
  const inviterId = searchParams.get("id");
  const type = searchParams.get("type") as "store" | "maintenance";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [invitingEntityName, setInvitingEntityName] = useState("");
  
  useEffect(() => {
    const processInvitation = async () => {
      // Validate parameters
      if (!inviterId || !type || (type !== "store" && type !== "maintenance")) {
        setStatus("error");
        return;
      }
      
      try {
        // Get current user
        const currentUser = ConnectionService.getCurrentUser();
        
        // Get inviter name
        let inviterName = "";
        if (type === "store") {
          const provider = ConnectionService.getMaintenanceById(inviterId);
          inviterName = provider ? provider.name : inviterId;
          setInvitingEntityName(inviterName);
          
          // Process connection - store accepting invitation from maintenance
          const success = await ConnectionService.requestConnection(
            currentUser.id, // Store ID
            inviterId // Maintenance ID
          );
          
          if (success) {
            // Auto-accept the connection since it's from an invitation
            const connections = ConnectionService.getStoredConnections();
            const connection = connections.find(
              conn => conn.storeId === currentUser.id && conn.maintenanceId === inviterId
            );
            
            if (connection) {
              await ConnectionService.acceptConnection(connection.id);
              setStatus("success");
            } else {
              throw new Error("Connection not found after creation");
            }
          } else {
            throw new Error("Failed to create connection");
          }
        } else {
          // Handle store inviting maintenance
          const store = ConnectionService.getStoreById(inviterId);
          inviterName = store ? store.name : inviterId;
          setInvitingEntityName(inviterName);
          
          // Process connection - maintenance accepting invitation from store
          const success = await ConnectionService.requestConnection(
            inviterId, // Store ID
            currentUser.id // Maintenance ID
          );
          
          if (success) {
            setStatus("success");
          } else {
            throw new Error("Failed to create connection");
          }
        }
        
        toast({
          title: "Connection Successful",
          description: `You are now connected with ${inviterName}`,
        });
      } catch (error) {
        console.error("Invitation processing error:", error);
        setStatus("error");
        
        toast({
          title: "Error Processing Invitation",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };
    
    processInvitation();
  }, [inviterId, type, navigate, toast]);
  
  const handleContinue = () => {
    if (type === "store") {
      navigate("/customer/dashboard");
    } else {
      navigate("/dashboard");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitation Response</CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Processing your invitation..."
              : status === "success"
                ? `You have successfully connected with ${invitingEntityName}`
                : "There was a problem processing your invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            {status === "loading" ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : status === "success" ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-red-500" />
            )}
            
            <p className="mt-4 text-center text-muted-foreground">
              {status === "loading" 
                ? "Please wait while we process your invitation..." 
                : status === "success"
                  ? "Your account has been successfully connected."
                  : "We couldn't process your invitation. Please check the URL and try again."}
            </p>
          </div>
          
          <div className="flex justify-center">
            {status !== "loading" && (
              <Button onClick={handleContinue}>
                Continue to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
