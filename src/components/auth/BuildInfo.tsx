
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

export const BuildInfo = ({ buildVersion, onRefresh, refreshing }: BuildInfoProps) => {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
        onClick={onRefresh}
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
            <p className="text-xs">Build: {buildVersion}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
