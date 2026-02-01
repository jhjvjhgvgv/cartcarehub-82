import { useEffect } from "react";
import { LoadingView } from "@/components/auth/LoadingView";

interface LoadingHandlerProps {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  onLoadingComplete: () => void;
}

export const LoadingHandler = ({ isLoading, setIsLoading, onLoadingComplete }: LoadingHandlerProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  if (isLoading) {
    return <LoadingView onLoadingComplete={onLoadingComplete} />;
  }
  
  return null;
};
