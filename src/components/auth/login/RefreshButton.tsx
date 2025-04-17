
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface RefreshButtonProps {
  onRefresh: () => void;
}

export const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const refreshAttemptCount = useRef(0);
  const { toast } = useToast();

  const handleRefresh = () => {
    refreshAttemptCount.current += 1;
    
    if (refreshAttemptCount.current > 3) {
      toast({
        title: "Too Many Refreshes",
        description: "Please wait a moment before trying again.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        refreshAttemptCount.current = 0;
      }, 10000);
      
      return;
    }
    
    setRefreshing(true);
    onRefresh();
  };

  return { refreshing, handleRefresh };
};
