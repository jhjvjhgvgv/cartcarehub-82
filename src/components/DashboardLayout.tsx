import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, LayoutDashboard, Users, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarContent>
            <div className="px-3 py-4">
              <h2 className="text-xl font-bold text-primary-800 mb-6">CartRepairPros</h2>
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary-50 ${
                    isActive('/') ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/carts" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary-50 ${
                    isActive('/carts') ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Carts</span>
                </Link>
                <Link 
                  to="/customers" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary-50 ${
                    isActive('/customers') ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Customers</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary-50 ${
                    isActive('/settings') ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6">
          <SidebarTrigger className="mb-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;