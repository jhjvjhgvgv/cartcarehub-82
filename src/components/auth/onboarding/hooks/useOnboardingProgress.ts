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
      // Check profile onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setCurrentStep(profile.onboarding_step || 1);
        setOnboardingCompleted(profile.onboarding_completed || false);
      }

      // Fetch step progress
      const { data: progressData } = await supabase
        .from('onboarding_progress')
        .select('step_number, step_name, completed, completed_at, data')
        .eq('user_id', user.id)
        .order('step_number', { ascending: true });

      if (progressData) {
        const mappedSteps: OnboardingStep[] = progressData.map((item: any) => ({
          step_number: item.step_number,
          step_name: item.step_name,
          completed: item.completed,
          completed_at: item.completed_at || undefined,
          data: (item.data || {}) as Record<string, any>,
        }));
        setSteps(mappedSteps);
      }
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStep = async (stepNumber: number, stepName: string, completed: boolean, data?: Record<string, any>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_number: stepNumber,
          step_name: stepName,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          data: data || {},
        }, {
          onConflict: 'user_id,step_number',
        });

      if (error) {
        console.error('Error updating step:', error);
        return false;
      }

      await fetchProgress();
      return true;
    } catch (err) {
      console.error('Error updating onboarding step:', err);
      return false;
    }
  };

  const completeStep = async (stepNumber: number, stepName: string, data?: Record<string, any>) => {
    const success = await updateStep(stepNumber, stepName, true, data);
    if (success) {
      // Update profile current step
      await supabase
        .from('profiles')
        .update({ onboarding_step: stepNumber + 1 })
        .eq('id', user!.id);
      
      setCurrentStep(stepNumber + 1);
    }
    return success;
  };

  const completeOnboarding = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return false;
      }

      setOnboardingCompleted(true);
      return true;
    } catch (err) {
      console.error('Error completing onboarding:', err);
      return false;
    }
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
