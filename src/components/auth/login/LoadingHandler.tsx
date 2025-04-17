
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingView } from "@/components/auth/LoadingView";

interface LoadingHandlerProps {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  onLoadingComplete: () => void;
}

export const LoadingHandler = ({ isLoading, setIsLoading, onLoadingComplete }: LoadingHandlerProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const testMode = localStorage.getItem("testMode");
    if (testMode) {
      const role = localStorage.getItem("testRole") as "maintenance" | "store";
      if (role === "maintenance") {
        navigate("/dashboard");
      } else if (role === "store") {
        navigate("/customer/dashboard");
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, setIsLoading]);

  if (isLoading) {
    return <LoadingView onLoadingComplete={onLoadingComplete} />;
  }
  
  return null;
};
