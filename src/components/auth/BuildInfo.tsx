
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BuildInfoProps {
  buildVersion: string;
  onRefresh: () => void;
  refreshing: boolean;
}

// Declare the global window property for TypeScript with correct Promise return type
declare global {
  interface Window {
    updateSW?: () => Promise<void>;
  }
}

export const BuildInfo = ({ buildVersion, onRefresh, refreshing }: BuildInfoProps) => {
  const handleRefresh = async () => {
    // First try to update service worker if available
    if (window.updateSW) {
      try {
        await window.updateSW();
        console.log("Service worker update triggered");
      } catch (err) {
        console.error("Error updating service worker:", err);
      }
    }
    
    // Then do the regular app refresh
    onRefresh();
  };
  
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        {refreshing ? "Refreshing..." : "Refresh App"}
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
            >
              <Info size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Version: {buildVersion}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
