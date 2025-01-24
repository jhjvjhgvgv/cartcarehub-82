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
              <h2 className="mb-6 px-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  CartRepairPros
                </span>
              </h2>
              <nav className="space-y-1.5">
                <Link 
                  to="/" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/') 
                      ? 'bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-100' 
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${isActive('/') ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link 
                  to="/carts" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/carts')
                      ? 'bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className={`w-5 h-5 ${isActive('/carts') ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Carts</span>
                </Link>
                <Link 
                  to="/customers" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/customers')
                      ? 'bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                  }`}
                >
                  <Users className={`w-5 h-5 ${isActive('/customers') ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Customers</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive('/settings')
                      ? 'bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                  }`}
                >
                  <Settings className={`w-5 h-5 ${isActive('/settings') ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Settings</span>
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