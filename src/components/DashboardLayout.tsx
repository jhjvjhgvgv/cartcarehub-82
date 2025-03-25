
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TestModeIndicator } from "./ui/test-mode-indicator";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = () => {
    // If in test mode, clear test mode data
    if (localStorage.getItem("testMode") === "true") {
      localStorage.removeItem("testMode");
      localStorage.removeItem("testRole");
    }
    
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
    navigate("/");
  };

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
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
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
        <TestModeIndicator />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
