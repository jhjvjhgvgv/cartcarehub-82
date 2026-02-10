import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Invite() {
  const [searchParams] = useSearchParams();
  const inviterOrgId = searchParams.get("id");
  const type = searchParams.get("type") as "store" | "maintenance";
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [invitingEntityName, setInvitingEntityName] = useState("");
  
  useEffect(() => {
    const processInvitation = async () => {
      if (!inviterOrgId || !type || (type !== "store" && type !== "maintenance")) {
        setStatus("error");
        return;
      }
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Redirect to login with return URL
          navigate(`/auth?redirect=/invite?id=${inviterOrgId}&type=${type}${token ? `&token=${token}` : ''}`);
          return;
        }

        // Look up the inviter organization name
        const { data: inviterOrg } = await supabase
          .from('organizations')
          .select('id, name, type')
          .eq('id', inviterOrgId)
          .maybeSingle();

        const inviterName = inviterOrg?.name || inviterOrgId;
        setInvitingEntityName(inviterName);

        // Look up the current user's org membership
        const { data: membership } = await supabase
          .from('org_memberships')
          .select('org_id, role, organizations(id, name, type)')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (!membership?.org_id) {
          throw new Error("You need to complete your profile setup before accepting invitations. Please set up your organization first.");
        }

        const currentUserOrgId = membership.org_id;
        const currentUserOrgType = (membership.organizations as any)?.type;

        // Determine store and provider org IDs based on invitation type
        let storeOrgId: string;
        let providerOrgId: string;

        if (type === "store") {
          // Current user is being invited as a store, inviter is a provider
          storeOrgId = currentUserOrgId;
          providerOrgId = inviterOrgId;
        } else {
          // Current user is being invited as a maintenance provider, inviter is a store
          storeOrgId = inviterOrgId;
          providerOrgId = currentUserOrgId;
        }

        // Check if connection already exists
        const { data: existingLink } = await supabase
          .from('provider_store_links')
          .select('id, status')
          .eq('store_org_id', storeOrgId)
          .eq('provider_org_id', providerOrgId)
          .maybeSingle();

        if (existingLink) {
          if (existingLink.status === 'active') {
            setStatus("success");
            toast({
              title: "Already Connected",
              description: `You are already connected with ${inviterName}`,
            });
            return;
          }
          // If pending, activate it
          const { error: updateError } = await supabase
            .from('provider_store_links')
            .update({ status: 'active' })
            .eq('id', existingLink.id);

          if (updateError) throw updateError;
        } else {
          // Create new active connection
          const { error: insertError } = await supabase
            .from('provider_store_links')
            .insert({
              store_org_id: storeOrgId,
              provider_org_id: providerOrgId,
              status: 'active'
            });

          if (insertError) throw insertError;
        }

        // If there's a token, mark the invitation as accepted
        if (token) {
          await supabase
            .from('invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('token', token);
        }

        // Send notification about accepted connection
        try {
          await supabase.functions.invoke('connection-notification', {
            body: {
              type: 'accepted',
              storeOrgId: storeOrgId,
              providerOrgId: providerOrgId,
              recipientEmail: '', // Will be looked up by the edge function
              message: `Connection accepted between organizations`
            }
          });
        } catch (notifError) {
          console.warn("Failed to send notification, connection still created:", notifError);
        }
        
        setStatus("success");
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
  }, [inviterOrgId, type, token, navigate, toast]);
  
  const handleContinue = () => {
    if (type === "store") {
      navigate("/customer/dashboard");
    } else {
      navigate("/dashboard");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
              <AlertTriangle className="h-16 w-16 text-destructive" />
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
