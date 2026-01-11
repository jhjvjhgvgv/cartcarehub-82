import { useEffect, useRef } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface EmailVerificationStepProps {
  onComplete: () => void;
}

export const EmailVerificationStep = ({ onComplete }: EmailVerificationStepProps) => {
  const { user } = useAuth();
  const {
    isVerified,
    isChecking,
    canResend,
    resendCooldown,
    resendVerificationEmail,
  } = useEmailVerification();
  
  // Use ref to prevent multiple calls
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (isVerified && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      toast.success('Email verified successfully!');
      onComplete();
    }
  }, [isVerified, onComplete]);

  const handleResend = async () => {
    const result = await resendVerificationEmail();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (isChecking) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Mail className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to <strong>{user?.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please check your inbox and click the verification link to continue. The link will expire in 24 hours.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email?</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          <Button
            onClick={handleResend}
            disabled={!canResend}
            variant="outline"
            className="w-full"
          >
            {canResend ? (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resend in {resendCooldown}s
              </>
            )}
          </Button>
        </div>

        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            This page will automatically update once your email is verified. You can also refresh the page manually.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
