import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface OnboardingStep {
  step_number: number;
  step_name: string;
  completed: boolean;
  completed_at?: string;
  data?: Record<string, any>;
}

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has any org memberships (means onboarding is complete)
      const { data: memberships } = await supabase
        .from('org_memberships')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        setOnboardingCompleted(true);
        setCurrentStep(4); // Final step
      }
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStep = async (stepNumber: number, _stepName: string, completed: boolean, _data?: Record<string, any>) => {
    if (!user) return false;

    try {
      if (completed) {
        setCurrentStep(stepNumber + 1);
      }
      return true;
    } catch (err) {
      console.error('Error updating onboarding step:', err);
      return false;
    }
  };

  const completeStep = async (stepNumber: number, stepName: string, data?: Record<string, any>) => {
    const success = await updateStep(stepNumber, stepName, true, data);
    if (success) {
      setCurrentStep(stepNumber + 1);
    }
    return success;
  };

  const completeOnboarding = async () => {
    if (!user) return false;
    setOnboardingCompleted(true);
    return true;
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    currentStep,
    steps,
    loading,
    onboardingCompleted,
    completeStep,
    updateStep,
    completeOnboarding,
    refreshProgress: fetchProgress,
  };
};
