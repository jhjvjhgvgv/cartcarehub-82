import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = () => {
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
              <nav className="space-y-1.5">
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-primary-50 text-primary-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link 
                  to="/carts" 
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive('/carts')
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">Carts</span>
                </Link>
                <Link 
                  to="/customers" 
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive('/customers')
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Customers</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive('/settings')
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <SidebarTrigger className="p-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;