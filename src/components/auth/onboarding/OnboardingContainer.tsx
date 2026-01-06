import { useEffect, useState } from 'react';
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

const LOADING_TIMEOUT_MS = 15000;

export const OnboardingContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile();
  const { currentStep, loading, completeStep, completeOnboarding } = useOnboardingProgress();
  const [localStep, setLocalStep] = useState(1);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

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

  useEffect(() => {
    setLocalStep(currentStep);
  }, [currentStep]);

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

  // If profile is missing, default to store role and continue with onboarding
  // Don't keep showing loading - that causes infinite loop
  
  // Derive userRole from portal (provider -> maintenance, else store)
  // Default to 'store' if portal is undefined
  const userRole: 'store' | 'maintenance' = profile?.portal === 'provider' ? 'maintenance' : 'store';

  // Define steps based on user role
  const storeSteps = [
    { number: 1, name: 'Verify Email', completed: localStep > 1 },
    { number: 2, name: 'Profile', completed: localStep > 2 },
    { number: 3, name: 'Store Location', completed: localStep > 3 },
    { number: 4, name: 'Connect', completed: localStep > 4 },
  ];

  const maintenanceSteps = [
    { number: 1, name: 'Verify Email', completed: localStep > 1 },
    { number: 2, name: 'Profile', completed: localStep > 2 },
    { number: 3, name: 'Verification', completed: localStep > 3 },
  ];

  const steps = userRole === 'store' ? storeSteps : maintenanceSteps;

  const handleStepComplete = async (stepNumber: number, stepName: string) => {
    const success = await completeStep(stepNumber, stepName);
    if (success) {
      setLocalStep(stepNumber + 1);
    }
  };

  const handleOnboardingComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      toast.success('Welcome! Your account is ready.');
      
      // Navigate to appropriate dashboard based on portal
      if (profile.portal === 'provider') {
        navigate('/dashboard');
      } else if (profile.portal === 'corp') {
        navigate('/admin');
      } else {
        navigate('/customer/dashboard');
      }
    }
  };

  const renderStep = () => {
    switch (localStep) {
      case 1:
        return (
          <EmailVerificationStep
            onComplete={() => handleStepComplete(1, 'Email Verification')}
          />
        );
      
      case 2:
        return (
          <ProfileDetailsStep
            onComplete={() => handleStepComplete(2, 'Profile Details')}
            userRole={userRole}
          />
        );
      
      case 3:
        if (userRole === 'store') {
          return (
            <StoreLocationStep
              onComplete={() => handleStepComplete(3, 'Store Location')}
              onSkip={() => handleStepComplete(3, 'Store Location (Skipped)')}
            />
          );
        } else {
          return (
            <MaintenanceVerificationStep
              onComplete={handleOnboardingComplete}
            />
          );
        }
      
      case 4:
        if (userRole === 'store') {
          return (
            <ConnectProviderStep
              onComplete={handleOnboardingComplete}
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
      </div>
    </div>
  );
};
