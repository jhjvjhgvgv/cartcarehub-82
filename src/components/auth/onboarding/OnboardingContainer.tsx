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
import { toast } from 'sonner';

export const OnboardingContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { currentStep, loading, completeStep, completeOnboarding } = useOnboardingProgress();
  const [localStep, setLocalStep] = useState(1);

  useEffect(() => {
    setLocalStep(currentStep);
  }, [currentStep]);

  // Show loading while checking auth/profile status
  if (loading || profileLoading) {
    return <LoadingView onLoadingComplete={() => {}} />;
  }

  // If no user, redirect to login (but only after loading completes)
  if (!user) {
    navigate('/');
    return null;
  }

  // If profile is still loading or missing, show loading (don't redirect - that causes loop)
  if (!profile) {
    return <LoadingView onLoadingComplete={() => {}} />;
  }

  // Default to 'store' role if role is not set (prevents crash on null role)
  const userRole = (profile.role as 'store' | 'maintenance') || 'store';

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
      
      // Navigate to appropriate dashboard
      if (userRole === 'maintenance') {
        navigate('/dashboard');
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
