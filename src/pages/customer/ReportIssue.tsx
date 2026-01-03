import { useState, useEffect } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AICartAssistant } from "@/components/customer/AICartAssistant";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const ReportIssue = () => {
  const { toast } = useToast();
  const [cartIdentifier, setCartIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Find the cart by qr_token or asset_tag
      const { data: cart } = await supabase
        .from('carts')
        .select('id, store_org_id, qr_token')
        .or(`qr_token.eq.${cartIdentifier},asset_tag.eq.${cartIdentifier}`)
        .maybeSingle();

      if (!cart) {
        toast({
          title: "Cart Not Found",
          description: "The cart identifier you entered could not be found.",
          variant: "destructive"
        });
        return;
      }

      // Create issue record
      const { error: issueError } = await supabase
        .from('issues')
        .insert([{
          cart_id: cart.id,
          store_org_id: cart.store_org_id,
          description: description,
          severity: 'medium',
          status: 'open'
        }]);

      if (issueError) throw issueError;

      // Update cart status to out_of_service
      await supabase
        .from('carts')
        .update({ status: 'out_of_service' })
        .eq('id', cart.id);
      
      toast({
        title: "Issue Reported",
        description: "Your issue has been reported successfully.",
      });
      
      setCartIdentifier("");
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cartId">Cart ID or QR Token</Label>
                  <Input
                    id="cartId"
                    placeholder="Enter cart ID or QR token"
                    value={cartIdentifier}
                    onChange={(e) => setCartIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <AICartAssistant />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ReportIssue;
