
import React from 'react';
import { Bug, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

export const TestModeIndicator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = localStorage.getItem("testRole");

  const exitTestMode = () => {
    localStorage.removeItem("testMode");
    localStorage.removeItem("testRole");
    toast({
      title: "Test Mode Disabled",
      description: "You've exited test mode and returned to the login screen.",
    });
    navigate("/");
  };

  if (localStorage.getItem("testMode") !== "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-2 rounded-full shadow-lg">
      <Bug size={16} />
      <span className="text-xs font-medium whitespace-nowrap">Test Mode: {role === "maintenance" ? "Maintenance" : "Store"}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-black/10 hover:bg-black/20"
        onClick={exitTestMode}
        title="Exit Test Mode"
      >
        <LogOut size={12} />
      </Button>
    </div>
  );
};
