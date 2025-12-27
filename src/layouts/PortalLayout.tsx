import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useOrg, isStoreRole, isCorpRole, isProviderRole } from '@/contexts/OrgContext';
import { OrgSwitcher } from '@/components/org/OrgSwitcher';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ShoppingCart,
  QrCode,
  Settings,
  LogOut,
  Building2,
  Users,
  Wrench,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeMembership, activeOrg, isLoading } = useOrg();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      localStorage.removeItem('activeOrgId');
      navigate('/', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const role = activeMembership?.role;
  const navItems = getNavItems(role);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span>CartCare</span>
            </Link>
            <OrgSwitcher />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t pt-4">
            <div className="text-xs text-muted-foreground mb-2">
              {activeOrg?.type === 'corporation' && 'Corporation Portal'}
              {activeOrg?.type === 'store' && 'Store Portal'}
              {activeOrg?.type === 'provider' && 'Provider Portal'}
            </div>
            {role && (
              <div className="text-xs text-muted-foreground">
                Role: {role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-2 z-50">
          <nav className="flex justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="truncate max-w-[60px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function getNavItems(role?: string): NavItem[] {
  if (!role) return [];

  if (isCorpRole(role as any)) {
    return [
      { label: 'Dashboard', path: '/corp/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Stores', path: '/corp/stores', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Settings', path: '/corp/settings', icon: <Settings className="h-4 w-4" /> },
    ];
  }

  if (isProviderRole(role as any)) {
    return [
      { label: 'Dashboard', path: '/provider/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Work Orders', path: '/provider/work-orders', icon: <ClipboardList className="h-4 w-4" /> },
      { label: 'My Jobs', path: '/tech/my-jobs', icon: <Wrench className="h-4 w-4" /> },
      { label: 'Linked Stores', path: '/provider/stores', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Settings', path: '/provider/settings', icon: <Settings className="h-4 w-4" /> },
    ];
  }

  // Store roles
  return [
    { label: 'Dashboard', path: '/store/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Carts', path: '/store/carts', icon: <ShoppingCart className="h-4 w-4" /> },
    { label: 'Scan', path: '/store/scan', icon: <QrCode className="h-4 w-4" /> },
    { label: 'Issues', path: '/store/issues', icon: <AlertTriangle className="h-4 w-4" /> },
    { label: 'Settings', path: '/store/settings', icon: <Settings className="h-4 w-4" /> },
  ];
}

export default PortalLayout;
