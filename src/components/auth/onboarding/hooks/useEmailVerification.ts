import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const useEmailVerification = () => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const checkVerificationStatus = useCallback(async () => {
    if (!user) {
      setIsVerified(false);
      setIsChecking(false);
      return;
    }

    try {
      // Check auth.users email_confirmed_at
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error checking verification:', error);
        setIsChecking(false);
        return;
      }

      const verified = !!authUser?.email_confirmed_at;
      setIsVerified(verified);
    } catch (err) {
      console.error('Verification check error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const resendVerificationEmail = async () => {
    if (!user?.email || !canResend) return { success: false, message: 'Please wait before resending' };

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Start 60 second cooldown
      setCanResend(false);
      setResendCooldown(60);
      
      return { success: true, message: 'Verification email sent!' };
    } catch (err) {
      return { success: false, message: 'Failed to resend email' };
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  // Auto-check verification every 5 seconds when not verified
  useEffect(() => {
    if (!isVerified && user) {
      const interval = setInterval(checkVerificationStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isVerified, user, checkVerificationStatus]);

  // Initial check
  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  return {
    isVerified,
    isChecking,
    canResend,
    resendCooldown,
    resendVerificationEmail,
    recheckVerification: checkVerificationStatus,
  };
};
