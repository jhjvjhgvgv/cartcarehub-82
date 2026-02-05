import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
  const { user, isLoading: authLoading } = useAuth();
  const { refreshProfile } = useUserProfile();
  const { 
    status,
    currentStep, 
    loading: onboardingLoading, 
    onboardingCompleted,
    completeStep, 
    completeVerification,
    completeProviderConnection,
    completeOnboarding,
    skipOnboarding,
    refreshProgress 
  } = useOnboardingProgress();
  
  const [localStep, setLocalStep] = useState<number>(1); // Default to email verification step
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [pendingRoleApplied, setPendingRoleApplied] = useState(false);

  // Handle pending role from OAuth callback (stored in localStorage before redirect)
  useEffect(() => {
    const applyPendingRole = async () => {
      if (!user || pendingRoleApplied) return;
      
      const pendingRole = localStorage.getItem('pending_signup_role');
      if (pendingRole && (pendingRole === 'store' || pendingRole === 'maintenance')) {
        console.log('🔄 Applying pending role from OAuth:', pendingRole);
        
        try {
          // Update user metadata with the stored role
          const { error } = await supabase.auth.updateUser({
            data: { role: pendingRole }
          });
          
          if (error) {
            console.error('Failed to apply pending role:', error);
          } else {
            console.log('✅ Role applied successfully:', pendingRole);
          }
        } catch (err) {
          console.error('Error applying pending role:', err);
        } finally {
          // Always clear localStorage after attempting
          localStorage.removeItem('pending_signup_role');
          setPendingRoleApplied(true);
        }
      } else {
        setPendingRoleApplied(true);
      }
    };
    
    applyPendingRole();
  }, [user, pendingRoleApplied]);

  // Derive userRole directly from user metadata - no profile dependency
  const userRole: 'store' | 'maintenance' = useMemo(() => {
    const metaRole = user?.user_metadata?.role;
    return metaRole === 'maintenance' ? 'maintenance' : 'store';
  }, [user?.user_metadata?.role]);

  // Loading timeout to prevent infinite loading
  useEffect(() => {
    if (authLoading || onboardingLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [authLoading, onboardingLoading]);

  // Handle no-user redirect via effect, not during render
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('❌ No user, will redirect to login');
      setShouldRedirectToLogin(true);
    }
  }, [authLoading, user]);

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

  // Calculate correct step based on status and role - in useEffect only
  useEffect(() => {
    // Don't calculate until we have both user and status
    if (!user || !status) {
      return;
    }
    
    // Don't recalculate if already redirecting
    if (isRedirecting) {
      return;
    }
    
    if (status.onboarding_completed || status.skipped_at) {
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
        navigateToDashboard();
        return;
      }
    }
    
    setLocalStep(step);
  }, [user, status, userRole, isRedirecting, navigateToDashboard, localStep]);

  // Handle onboarding completion for step > 4
  useEffect(() => {
    if (localStep > 4 && !isRedirecting && status && !status.onboarding_completed) {
      console.log('🎯 Step > 4, completing onboarding...');
      completeOnboarding().then(success => {
        if (success) {
          toast.success('Welcome! Your account is ready.');
          navigateToDashboard();
        }
      });
    }
  }, [localStep, isRedirecting, status, completeOnboarding, navigateToDashboard]);

  // Define steps based on user role
  const storeSteps = useMemo(() => [
    { number: 1, name: 'Verify Email', completed: status?.email_verified || false },
    { number: 2, name: 'Profile', completed: status?.profile_completed || false },
    { number: 3, name: 'Store Location', completed: status?.location_completed || false },
    { number: 4, name: 'Connect', completed: status?.provider_connected || false },
  ], [status]);

  const maintenanceSteps = useMemo(() => [
    { number: 1, name: 'Verify Email', completed: status?.email_verified || false },
    { number: 2, name: 'Profile', completed: status?.profile_completed || false },
    { number: 3, name: 'Verification', completed: status?.verification_submitted || false },
  ], [status]);

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

  // Render step content with error handling
  const renderStep = () => {
    
    try {
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
          // Fall through to default for non-store at step 4
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Completing setup...</p>
            </div>
          );
        
        default:
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Completing setup...</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering step:', error);
      return (
        <div className="max-w-2xl mx-auto p-6 text-center space-y-4 bg-card rounded-lg border">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground">We encountered an error loading this step.</p>
          <Button 
            onClick={() => {
              setInitError(null);
              refreshProgress();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }
  };

  // === RENDER LOGIC - Never return null, always show meaningful UI ===

  // Redirect to login if no user (use Navigate component, not navigate())
  if (shouldRedirectToLogin) {
    return <Navigate to="/" replace />;
  }

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

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while onboarding status is being fetched
  if (onboardingLoading || !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (isRedirecting || onboardingCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Main onboarding UI
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
