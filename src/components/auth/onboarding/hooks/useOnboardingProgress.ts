import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface OnboardingStatus {
  email_verified: boolean;
  profile_completed: boolean;
  location_completed: boolean;
  provider_connected: boolean;
  verification_submitted: boolean;
  onboarding_completed: boolean;
  skipped_at: string | null;
  completed_at: string | null;
}

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const calculateStep = useCallback((data: OnboardingStatus, userRole: 'store' | 'maintenance'): number => {
    if (data.onboarding_completed || data.skipped_at) return 5;
    if (!data.email_verified) return 1;
    if (!data.profile_completed) return 2;
    
    if (userRole === 'store') {
      if (!data.location_completed) return 3;
      if (!data.provider_connected) return 4;
    } else {
      if (!data.verification_submitted) return 3;
    }
    
    return 5; // All done
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First check if onboarding record exists
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        // Create onboarding record if it doesn't exist
        const { data: authUser } = await supabase.auth.getUser();
        const emailVerified = !!authUser.user?.email_confirmed_at;
        
        const { data: newRecord, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            email_verified: emailVerified,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating onboarding record:', insertError);
          // Still proceed with defaults
          setStatus({
            email_verified: emailVerified,
            profile_completed: false,
            location_completed: false,
            provider_connected: false,
            verification_submitted: false,
            onboarding_completed: false,
            skipped_at: null,
            completed_at: null,
          });
        } else {
          setStatus(newRecord as OnboardingStatus);
          setOnboardingCompleted(newRecord.onboarding_completed);
        }
      } else {
        setStatus(data as OnboardingStatus);
        setOnboardingCompleted(data.onboarding_completed);
      }
    } catch (err) {
      console.error('Error in fetchProgress:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update a specific field in onboarding
  const updateOnboardingField = async (field: keyof OnboardingStatus, value: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating onboarding:', error);
        return false;
      }

      setStatus(prev => prev ? { ...prev, [field]: value } : null);
      return true;
    } catch (err) {
      console.error('Error updating onboarding:', err);
      return false;
    }
  };

  const completeStep = async (stepNumber: number, stepName: string): Promise<boolean> => {
    const fieldMap: Record<number, keyof OnboardingStatus> = {
      1: 'email_verified',
      2: 'profile_completed',
      3: 'location_completed', // or verification_submitted for maintenance
    };

    const field = fieldMap[stepNumber];
    if (!field) return true; // Step doesn't map to a field

    const success = await updateOnboardingField(field, true);
    if (success) {
      setCurrentStep(stepNumber + 1);
    }
    return success;
  };

  const completeVerification = async (): Promise<boolean> => {
    return updateOnboardingField('verification_submitted', true);
  };

  const completeProviderConnection = async (): Promise<boolean> => {
    return updateOnboardingField('provider_connected', true);
  };

  const completeOnboarding = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({
          onboarding_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

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

  const skipOnboarding = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({
          onboarding_completed: true,
          skipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error skipping onboarding:', error);
        return false;
      }

      setOnboardingCompleted(true);
      return true;
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      return false;
    }
  };

  // Calculate current step when status changes
  useEffect(() => {
    if (status) {
      // Default to store role for step calculation - actual role is determined in component
      const step = calculateStep(status, 'store');
      setCurrentStep(step);
    }
  }, [status, calculateStep]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    status,
    currentStep,
    loading,
    onboardingCompleted,
    completeStep,
    completeVerification,
    completeProviderConnection,
    completeOnboarding,
    skipOnboarding,
    refreshProgress: fetchProgress,
  };
};
