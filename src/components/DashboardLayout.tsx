
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ConnectionService } from "@/services/ConnectionService";
import { isNewAccountSession, setNewAccountSessionFlag, clearFlagsOnSettingsNavigation } from "@/services/connection/storage-utils";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasConnections, setHasConnections] = useState(true);
  const [isNewAccount, setIsNewAccount] = useState(false);

  useEffect(() => {
    // Check if it's a new account session to skip sample data
    const newAccount = isNewAccountSession();
    setIsNewAccount(newAccount);

    if (newAccount) {
      // If navigating to settings, clear the flags so settings can work normally
      if (location.pathname === "/settings") {
        clearFlagsOnSettingsNavigation();
        setIsNewAccount(false);
      }
      setHasConnections(false); // Treat as no connections so require real setup
      return;
    }
    
    // Check if we're in test mode
    if (localStorage.getItem("testMode") === "true") {
      return; // Don't check connections in test mode
    }
    
    // Verify that the maintenance provider has active connections
    const checkConnections = async () => {
      try {
        // For maintenance users, we'll need to get the user ID from authentication
        // This is a simplified fix - in a real app, we'd use proper auth context
        const userId = localStorage.getItem('testMode') === 'true' ? 'test-maintenance-user' : '';
        const connections = await ConnectionService.getMaintenanceRequests(userId);
        
        const hasActiveConnections = connections.some(conn => conn.status === "active");
        setHasConnections(hasActiveConnections);
        
        if (!hasActiveConnections && location.pathname !== "/settings") {
          toast({
            title: "No Active Connections",
            description: "You don't have any active store connections. Please connect to at least one store.",
            variant: "destructive"
          });
          navigate("/settings");
        }
      } catch (error) {
        console.error("Error checking connections:", error);
      }
    };
    
    checkConnections();
  }, [location.pathname, navigate, toast]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Carts",
      href: "/carts",
      icon: ShoppingCart,
      disabled: !hasConnections
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      disabled: !hasConnections
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Admin",
      href: "/admin",
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    try {
      console.log("🚪 Dashboard layout sign out initiated");
      
      // Import the safe sign out utility
      const { safeSignOut } = await import("@/utils/session-debug");
      await safeSignOut();
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback - just navigate to home
      navigate("/");
    }
  };

  // Only show welcome screen for new accounts on dashboard routes
  if (isNewAccount && (location.pathname === "/" || location.pathname === "/dashboard")) {
    // Show a simple UI for new accounts with no sample data
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">Welcome to your new Dashboard!</h1>
          <p className="mb-6 text-gray-700 text-center max-w-md">
            This is a fresh account with no sample data. Start from scratch by connecting to your stores and adding your carts and customers.
          </p>
          <Link
            to="/settings"
            className="inline-block rounded bg-primary px-6 py-3 text-white hover:bg-primary-dark transition"
          >
            Go to Settings to Connect Stores
          </Link>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="bg-white border-r border-gray-200">
          <SidebarContent>
            <div className="px-3 py-4">
              <h2 className="mb-6 px-2 text-lg md:text-2xl">
                <span className="font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  CartRepairPros
                </span>
              </h2>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all",
                      location.pathname === item.href
                        ? "bg-primary-50 text-primary-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.disabled && (
                      <span className="ml-auto text-xs text-gray-400">Requires connection</span>
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all text-gray-600 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <SidebarTrigger className="p-4" />
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

