
import React from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserRole = "maintenance" | "store";

interface TestModeProps {
  onEnterTestMode: (role: UserRole) => void;
}

export const TestMode = ({ onEnterTestMode }: TestModeProps) => {
  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-3">
        <p className="text-white text-sm text-center font-medium flex items-center justify-center gap-1">
          <Bug size={16} /> Test Mode (Bypass Login)
        </p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
            onClick={() => onEnterTestMode("maintenance")}
          >
            Maintenance
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
            onClick={() => onEnterTestMode("store")}
          >
            Store
          </Button>
        </div>
      </div>
    </div>
  );
};
