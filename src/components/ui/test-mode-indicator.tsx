import React from 'react';
import { Bug, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const goToLoginScreen = () => {
    // Keep test mode enabled but navigate to login screen
    navigate("/");
    toast({
      title: "Test Login Page",
      description: "Viewing login page. Test mode is still active.",
    });
  };

  const switchRole = () => {
    const newRole = role === "maintenance" ? "store" : "maintenance";
    localStorage.setItem("testRole", newRole);
    toast({
      title: "Test Role Switched",
      description: `You're now viewing as ${newRole === "maintenance" ? "Maintenance" : "Store"} user.`,
    });
    
    // Navigate to the appropriate dashboard
    if (newRole === "maintenance") {
      navigate("/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  if (localStorage.getItem("testMode") !== "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-2 rounded-full shadow-lg">
      <Bug size={16} />
      <span className="text-xs font-medium whitespace-nowrap">Test Mode: {role === "maintenance" ? "Maintenance" : "Store"}</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-black/10 hover:bg-black/20"
            title="Test Mode Options"
          >
            <UserCircle size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={switchRole}>
            Switch to {role === "maintenance" ? "Store" : "Maintenance"} View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToLoginScreen}>
            View Login Page
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exitTestMode} className="text-red-600">
            Exit Test Mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
