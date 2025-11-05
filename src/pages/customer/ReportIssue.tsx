
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
import { useUserProfile } from "@/hooks/use-user-profile";
import { supabase } from "@/integrations/supabase/client";

const ReportIssue = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
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
        
        const userId = profile?.id || '';
        const connections = await ConnectionService.getStoreConnections(userId);
        
        const hasActiveConnections = connections.some(conn => conn.status === "active");
        setHasConnections(hasActiveConnections);
      } catch (error) {
        console.error("Error checking connections:", error);
      } finally {
        setIsCheckingConnections(false);
      }
    };
    
    checkConnections();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get connected maintenance providers
      const { data: connections } = await supabase
        .from('store_provider_connections')
        .select('provider_id')
        .eq('store_id', user.id)
        .eq('status', 'accepted');

      if (!connections || connections.length === 0) {
        toast({
          title: "No Connected Maintenance Providers",
          description: "Please connect to a maintenance provider first.",
          variant: "destructive"
        });
        return;
      }

      // Find the cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id, store_id, qr_code')
        .eq('qr_code', cartId)
        .maybeSingle();

      if (!cart) {
        toast({
          title: "Cart Not Found",
          description: "The cart ID you entered could not be found.",
          variant: "destructive"
        });
        return;
      }

      // Create maintenance request for the first connected provider
      const { error: requestError } = await supabase
        .from('maintenance_requests')
        .insert({
          cart_id: cart.id,
          provider_id: connections[0].provider_id,
          store_id: cart.store_id,
          request_type: 'repair',
          priority: 'high',
          status: 'pending',
          description: description
        });

      if (requestError) throw requestError;

      // Update cart issues
      const { data: existingCart } = await supabase
        .from('carts')
        .select('issues')
        .eq('id', cart.id)
        .single();

      const updatedIssues = [...(existingCart?.issues || []), description];

      await supabase
        .from('carts')
        .update({ issues: updatedIssues, status: 'maintenance' })
        .eq('id', cart.id);
      
      toast({
        title: "Issue Reported",
        description: "Maintenance request created successfully.",
      });
      
      setCartId("");
      setDescription("");
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
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
