import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useOnboardingProgress } from './hooks/useOnboardingProgress';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { EmailVerificationStep } from './steps/EmailVerificationStep';
import { ProfileDetailsStep } from './steps/ProfileDetailsStep';
import { StoreLocationStep } from './steps/StoreLocationStep';
import { MaintenanceVerificationStep } from './steps/MaintenanceVerificationStep';
import { ConnectProviderStep } from './steps/ConnectProviderStep';
import { LoadingView } from '@/components/auth/LoadingView';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { getDashboardPath } from '@/contexts/OrgContext';

const LOADING_TIMEOUT_MS = 15000;

export const OnboardingContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile();
  const { 
    status,
    currentStep, 
    loading, 
    onboardingCompleted,
    completeStep, 
    completeVerification,
    completeProviderConnection,
    completeOnboarding,
    skipOnboarding,
    refreshProgress 
  } = useOnboardingProgress();
  const [localStep, setLocalStep] = useState<number | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Derive userRole from portal or user metadata - memoized for stability
  const userRole: 'store' | 'maintenance' = useMemo(() => {
    const metaRole = user?.user_metadata?.role;
    return profile?.portal === 'provider' ? 'maintenance' : 
           metaRole === 'maintenance' ? 'maintenance' : 'store';
  }, [profile?.portal, user?.user_metadata?.role]);

  // Loading timeout to prevent infinite loading
  useEffect(() => {
    if (loading || profileLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading, profileLoading]);

  // Navigate to dashboard helper - memoized
  const navigateToDashboard = useCallback(async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    
    // Get the user's membership to determine dashboard
    const { data: memberships } = await supabase
      .from('org_memberships')
      .select('role')
      .eq('user_id', user?.id)
      .limit(1);

    if (memberships && memberships.length > 0) {
      const path = getDashboardPath(memberships[0].role);
      navigate(path);
    } else {
      // Default based on role in metadata
      const metaRole = user?.user_metadata?.role;
      if (metaRole === 'maintenance') {
        navigate('/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [user?.id, user?.user_metadata?.role, navigate, isRedirecting]);

  // Calculate correct step based on status and role
  useEffect(() => {
    // Don't calculate until we have status (onboarding record)
    if (!status) return;
    // Don't recalculate if already redirecting
    if (isRedirecting) return;
    
    console.log('📋 Onboarding step calculation:', { 
      status, 
      userRole,
      profileLoading,
      isRedirecting
    });
    
    if (status.onboarding_completed || status.skipped_at) {
      // Already completed, redirect to dashboard
      navigateToDashboard();
      return;
    }
    
    // Calculate the step based on completion status
    let step = 1;
    if (!status.email_verified) {
      step = 1;
    } else if (!status.profile_completed) {
      step = 2;
    } else if (userRole === 'store') {
      if (!status.location_completed) {
        step = 3;
      } else {
        step = 4;
      }
    } else {
      // maintenance
      if (!status.verification_submitted) {
        step = 3;
      } else {
        // All done - redirect
        navigateToDashboard();
        return;
      }
    }
    
    console.log('📋 Setting step to:', step);
    setLocalStep(step);
  }, [status, userRole, profileLoading, isRedirecting, navigateToDashboard]);

  // Show timeout error if loading takes too long
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Loading Taking Too Long</h2>
          <p className="text-muted-foreground">
            We're having trouble loading your profile. This might be a temporary issue.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                setLoadingTimeout(false);
                refreshProfile();
                refreshProgress();
              }}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking auth/profile status
  if (loading || profileLoading) {
    return <LoadingView onLoadingComplete={() => {}} />;
  }

  // If no user, redirect to login
  if (!user) {
    navigate('/');
    return null;
  }

  // Already completed onboarding
  if (onboardingCompleted) {
    navigateToDashboard();
    return null;
  }

  // Wait until step is calculated
  if (localStep === null) {
    return <LoadingView onLoadingComplete={() => {}} />;
  }

  // Define steps based on user role (userRole is memoized at top)
  const storeSteps = [
    { number: 1, name: 'Verify Email', completed: status?.email_verified || false },
    { number: 2, name: 'Profile', completed: status?.profile_completed || false },
    { number: 3, name: 'Store Location', completed: status?.location_completed || false },
    { number: 4, name: 'Connect', completed: status?.provider_connected || false },
  ];

  const maintenanceSteps = [
    { number: 1, name: 'Verify Email', completed: status?.email_verified || false },
    { number: 2, name: 'Profile', completed: status?.profile_completed || false },
    { number: 3, name: 'Verification', completed: status?.verification_submitted || false },
  ];

  const steps = userRole === 'store' ? storeSteps : maintenanceSteps;

  const handleEmailVerified = useCallback(async () => {
    await completeStep(1, 'Email Verification');
    setLocalStep(2);
  }, [completeStep]);

  const handleProfileComplete = useCallback(async () => {
    await completeStep(2, 'Profile Details');
    setLocalStep(3);
  }, [completeStep]);

  const handleStoreLocationComplete = useCallback(async () => {
    await completeStep(3, 'Store Location');
    setLocalStep(4);
  }, [completeStep]);

  const handleStoreLocationSkip = useCallback(async () => {
    await completeStep(3, 'Store Location (Skipped)');
    setLocalStep(4);
  }, [completeStep]);

  const handleOnboardingComplete = useCallback(async () => {
    const success = await completeOnboarding();
    if (success) {
      toast.success('Welcome! Your account is ready.');
      navigateToDashboard();
    }
  }, [completeOnboarding, navigateToDashboard]);

  const handleVerificationComplete = useCallback(async () => {
    await completeVerification();
    const success = await completeOnboarding();
    if (success) {
      toast.success('Welcome! Your account is ready.');
      navigateToDashboard();
    }
  }, [completeVerification, completeOnboarding, navigateToDashboard]);

  const handleProviderConnected = useCallback(async () => {
    await completeProviderConnection();
    const success = await completeOnboarding();
    if (success) {
      toast.success('Welcome! Your account is ready.');
      navigateToDashboard();
    }
  }, [completeProviderConnection, completeOnboarding, navigateToDashboard]);

  const handleSkipOnboarding = useCallback(async () => {
    const success = await skipOnboarding();
    if (success) {
      toast.success('Welcome! You can complete setup later in Settings.');
      navigateToDashboard();
    }
  }, [skipOnboarding, navigateToDashboard]);

  const renderStep = () => {
    switch (localStep) {
      case 1:
        return (
          <EmailVerificationStep
            onComplete={handleEmailVerified}
          />
        );
      
      case 2:
        return (
          <ProfileDetailsStep
            onComplete={handleProfileComplete}
            userRole={userRole}
          />
        );
      
      case 3:
        if (userRole === 'store') {
          return (
            <StoreLocationStep
              onComplete={handleStoreLocationComplete}
              onSkip={handleStoreLocationSkip}
            />
          );
        } else {
          return (
            <MaintenanceVerificationStep
              onComplete={handleVerificationComplete}
            />
          );
        }
      
      case 4:
        if (userRole === 'store') {
          return (
            <ConnectProviderStep
              onComplete={handleProviderConnected}
              onSkip={handleOnboardingComplete}
            />
          );
        }
        break;
      
      default:
        handleOnboardingComplete();
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CartCare</h1>
          <p className="text-muted-foreground">
            Let's get your account set up in just a few steps
          </p>
        </div>

        <OnboardingProgressBar steps={steps} currentStep={localStep} />

        <div className="mt-8">
          {renderStep()}
        </div>

        {/* Skip link for users who want to explore */}
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            className="text-muted-foreground"
            onClick={handleSkipOnboarding}
          >
            Skip setup and explore →
          </Button>
        </div>
      </div>
    </div>
  );
};
