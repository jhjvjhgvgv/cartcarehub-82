
import { useState, useEffect } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AICartAssistant } from "@/components/customer/AICartAssistant";
import { ConnectionService } from "@/services/ConnectionService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ReportIssue = () => {
  const { toast } = useToast();
  const [cartId, setCartId] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConnections, setHasConnections] = useState(true);
  const [isCheckingConnections, setIsCheckingConnections] = useState(true);

  useEffect(() => {
    const checkConnections = async () => {
      try {
        // Skip in test mode
        if (localStorage.getItem("testMode") === "true") {
          setIsCheckingConnections(false);
          return;
        }
        
        const currentUser = ConnectionService.getCurrentUser();
        const connections = await ConnectionService.getStoreConnections(currentUser.id);
        
        const hasActiveConnections = connections.some(conn => conn.status === "active");
        setHasConnections(hasActiveConnections);
      } catch (error) {
        console.error("Error checking connections:", error);
      } finally {
        setIsCheckingConnections(false);
      }
    };
    
    checkConnections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user (store)
      const currentUser = ConnectionService.getCurrentUser();
      
      // Get connected maintenance providers
      const connections = await ConnectionService.getStoreConnections(currentUser.id);
      const activeConnections = connections.filter(conn => conn.status === "active");
      
      if (activeConnections.length === 0) {
        toast({
          title: "No Connected Maintenance Providers",
          description: "You don't have any active maintenance connections. Please connect to a maintenance provider first.",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate sending the issue to all connected maintenance providers
      for (const connection of activeConnections) {
        console.log(`Sending issue report to maintenance provider ${connection.maintenanceId}`);
        // In a real app, this would update the database and trigger a notification
      }
      
      // Add to recent activity (this would be stored in a database in a real app)
      const activity = {
        id: Math.random().toString(36).substring(7),
        type: "issue_report",
        date: new Date().toISOString(),
        description: `Reported issue with cart ${cartId}`,
        status: "pending",
      };
      
      console.log("New activity added:", activity);
      
      toast({
        title: "Issue Reported",
        description: "Your issue has been successfully reported. We'll look into it.",
      });
      
      setCartId("");
      setDescription("");
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast({
        title: "Error",
        description: "There was an error reporting your issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground">
            Let us know if you encounter any problems with your shopping cart.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isCheckingConnections ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Checking connection status...</p>
                </div>
              ) : !hasConnections ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No maintenance providers connected</AlertTitle>
                  <AlertDescription>
                    Please connect to a maintenance provider in Settings before reporting issues.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cartId">Cart ID</Label>
                    <Input
                      id="cartId"
                      placeholder="Enter cart ID (e.g., A12345)"
                      value={cartId}
                      onChange={(e) => setCartId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe the issue you're experiencing..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !hasConnections}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          
          <AICartAssistant />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ReportIssue;
