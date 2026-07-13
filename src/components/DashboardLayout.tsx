import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, LayoutDashboard, Users, Settings, LogOut, ClipboardList } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ConnectionService } from "@/services/ConnectionService";
import { isNewAccountSession, clearFlagsOnSettingsNavigation } from "@/services/connection/storage-utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUserProfile } from "@/hooks/use-user-profile";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, isMaintenanceUser } = useUserProfile();
  const [hasConnections, setHasConnections] = useState(true);
  const [isNewAccount, setIsNewAccount] = useState(false);

  useEffect(() => {
    const newAccount = isNewAccountSession();
    setIsNewAccount(newAccount);

    if (newAccount) {
      if (location.pathname === "/settings") {
        clearFlagsOnSettingsNavigation();
        setIsNewAccount(false);
      }
      setHasConnections(false);
      return;
    }

    if (localStorage.getItem("testMode") === "true") return;

    // Only gate maintenance providers; require profile with an org_id
    if (profileLoading || !profile?.org_id || !isMaintenanceUser) return;

    let cancelled = false;
    (async () => {
      try {
        const connections = await ConnectionService.getMaintenanceRequests(profile.org_id!);
        if (cancelled) return;
        const active = connections.some((c) => c.status === "active");
        setHasConnections(active);

        if (!active && location.pathname !== "/settings") {
          toast({
            title: "No Active Connections",
            description: "Connect to at least one store from Settings.",
            variant: "destructive",
          });
          navigate("/settings");
        }
      } catch (error) {
        console.error("Error checking connections:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, toast, profile?.org_id, profileLoading, isMaintenanceUser]);

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
      name: "My Queue",
      href: "/provider/queue",
      icon: ClipboardList,
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
          <div className="flex items-center justify-between p-4">
            <SidebarTrigger />
            <NotificationBell />
          </div>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

