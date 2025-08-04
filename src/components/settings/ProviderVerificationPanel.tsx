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
  Mail,
  Phone,
  Building,
  Loader2 
} from "lucide-react";

interface MaintenanceProvider {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  is_verified: boolean;
  verification_date: string | null;
  created_at: string;
}

export const ProviderVerificationPanel = () => {
  const { profile, isMaintenanceUser } = useUserProfile();
  const { toast } = useToast();
  const [provider, setProvider] = useState<MaintenanceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    if (isMaintenanceUser && profile) {
      loadProviderData();
    }
  }, [isMaintenanceUser, profile]);

  const loadProviderData = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('*')
        .eq('user_id', profile!.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading provider data:", error);
        return;
      }

      setProvider(data);
    } catch (error) {
      console.error("Failed to load provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    if (!provider) return;

    setSubmittingVerification(true);
    try {
      // In a real implementation, this would trigger an admin review process
      // For now, we'll simulate a verification request
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

  if (!provider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Provider Profile Missing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your maintenance provider profile hasn't been created yet. Please complete your profile setup.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getVerificationStatus = () => {
    if (provider.is_verified) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending Verification
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Provider Verification
          </span>
          {getVerificationStatus()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{provider.company_name}</p>
              <p className="text-sm text-muted-foreground">Company Name</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{provider.contact_email}</p>
              <p className="text-sm text-muted-foreground">Contact Email</p>
            </div>
          </div>
          
          {provider.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{provider.contact_phone}</p>
                <p className="text-sm text-muted-foreground">Contact Phone</p>
              </div>
            </div>
          )}
        </div>

        {provider.is_verified ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your provider account is verified. You can receive connection requests from stores.
              {provider.verification_date && (
                <span className="block text-sm mt-1">
                  Verified on {new Date(provider.verification_date).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your provider account is not yet verified. Verified providers can receive connection requests from stores.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={requestVerification}
              disabled={submittingVerification}
              className="gap-2"
            >
              {submittingVerification && <Loader2 className="h-4 w-4 animate-spin" />}
              Request Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};