import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building,
  Loader2 
} from "lucide-react";

interface ProviderOrg {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export const ProviderVerificationPanel = () => {
  const { profile, isMaintenanceUser } = useUserProfile();
  const { toast } = useToast();
  const [providerOrg, setProviderOrg] = useState<ProviderOrg | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    if (isMaintenanceUser && profile) {
      loadProviderData();
    } else {
      setLoading(false);
    }
  }, [isMaintenanceUser, profile]);

  const loadProviderData = async () => {
    try {
      // Get user's provider organization via memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('org_memberships')
        .select('org_id')
        .eq('user_id', profile!.id)
        .limit(1);

      if (membershipError) {
        console.error("Error loading memberships:", membershipError);
        return;
      }

      if (memberships && memberships.length > 0) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, type, created_at')
          .eq('id', memberships[0].org_id)
          .eq('type', 'provider')
          .maybeSingle();

        if (orgError) {
          console.error("Error loading organization:", orgError);
          return;
        }

        setProviderOrg(org);
      }
    } catch (error) {
      console.error("Failed to load provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    if (!providerOrg) return;

    setSubmittingVerification(true);
    try {
      // In a real implementation, this would trigger an admin review process
      toast({
        title: "Verification Requested",
        description: "Your verification request has been submitted. You'll be notified once reviewed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (!isMaintenanceUser) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providerOrg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Provider Profile Missing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your maintenance provider profile hasn't been created yet. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Provider Organization
          </span>
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{providerOrg.name}</p>
              <p className="text-sm text-muted-foreground">Organization Name</p>
            </div>
          </div>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your provider organization is active. You can receive work orders from linked stores.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
