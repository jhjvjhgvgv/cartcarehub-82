import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { clearAllAuthState, performFullAuthReset } from "@/utils/auth-cleanup";
import { useToast } from "@/hooks/use-toast";

interface ErrorRecoveryProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorRecovery = ({ error, onRetry }: ErrorRecoveryProps) => {
  const { toast } = useToast();

  const handleAuthReset = async () => {
    try {
      await performFullAuthReset();
      toast({
        title: "Authentication Reset",
        description: "Authentication state has been cleared. Please try again.",
      });
      // Redirect to login
      window.location.href = '/';
    } catch (err) {
      console.error("Reset failed:", err);
      toast({
        title: "Reset Failed",
        description: "Please refresh the page manually.",
        variant: "destructive",
      });
    }
  };

  const handlePageRefresh = () => {
    clearAllAuthState();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          
          <div className="space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button onClick={handleAuthReset} className="w-full" variant="outline">
              Reset Authentication
            </Button>
            
            <Button onClick={handlePageRefresh} className="w-full" variant="ghost">
              Refresh Page
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              If the problem persists, try clearing your browser data or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};