import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building,
  Loader2,
  FileText
} from "lucide-react";
import { ProviderVerificationForm } from "./ProviderVerificationForm";

interface ProviderOrg {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface VerificationStatus {
  id: string;
  status: string;
  license_number: string | null;
  insurance_provider: string | null;
  service_description: string | null;
  rejection_reason: string | null;
}

export const ProviderVerificationPanel = () => {
  const { toast } = useToast();
  const [providerOrg, setProviderOrg] = useState<ProviderOrg | null>(null);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isProviderUser, setIsProviderUser] = useState(false);

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      // Get current user directly from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has a provider membership
      const { data: memberships, error: membershipError } = await supabase
        .from('org_memberships')
        .select(`
          org_id,
          role,
          organizations!inner (
            id,
            name,
            type,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['provider_admin', 'provider_tech']);

      if (membershipError) {
        console.error("Error loading memberships:", membershipError);
        setLoading(false);
        return;
      }

      // Filter for provider organizations
      const providerMembership = memberships?.find(
        (m: any) => m.organizations?.type === 'provider'
      );

      if (!providerMembership) {
        setIsProviderUser(false);
        setLoading(false);
        return;
      }

      setIsProviderUser(true);
      const org = providerMembership.organizations as unknown as ProviderOrg;
      setProviderOrg(org);

      // Check for existing verification
      const { data: verificationData, error: verificationError } = await supabase
        .from('provider_verifications')
        .select('id, status, license_number, insurance_provider, service_description, rejection_reason')
        .eq('org_id', org.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (verificationError) {
        console.error("Error loading verification:", verificationError);
      } else {
        setVerification(verificationData);
      }
    } catch (error) {
      console.error("Failed to load provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadProviderData();
    toast({
      title: "Verification Submitted",
      description: "Your verification request has been submitted for review.",
    });
  };

  // Don't render for non-provider users
  if (!isProviderUser && !loading) {
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
            <AlertTriangle className="h-5 w-5 text-destructive" />
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

  // Show verification form
  if (showForm) {
    return (
      <ProviderVerificationForm
        orgId={providerOrg.id}
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
        existingData={verification}
      />
    );
  }

  // Determine verification status display
  const getStatusBadge = () => {
    if (!verification) {
      return (
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          Not Verified
        </Badge>
      );
    }
    
    switch (verification.status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Provider Organization
          </span>
          {getStatusBadge()}
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

        {/* Show appropriate message based on status */}
        {!verification && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your organization is not yet verified. Submit your business credentials to get verified and receive work orders from stores.
            </AlertDescription>
          </Alert>
        )}

        {verification?.status === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your verification request is being reviewed. You'll be notified once a decision is made.
            </AlertDescription>
          </Alert>
        )}

        {verification?.status === 'approved' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your provider organization is verified. You can receive work orders from linked stores.
            </AlertDescription>
          </Alert>
        )}

        {verification?.status === 'rejected' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p>Your verification was rejected.</p>
              {verification.rejection_reason && (
                <p className="mt-1 text-sm">Reason: {verification.rejection_reason}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Show submit/update button */}
        {(!verification || verification.status === 'rejected') && (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            {verification?.status === 'rejected' ? 'Resubmit Verification' : 'Submit Verification'}
          </Button>
        )}

        {verification?.status === 'pending' && (
          <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Update Submission
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
