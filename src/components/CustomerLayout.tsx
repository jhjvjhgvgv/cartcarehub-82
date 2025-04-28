import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, Home, Settings, Menu, LogOut, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { isNewAccountSession } from "@/services/connection/storage-utils";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (location.pathname === '/customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Check new account session on mount
  useEffect(() => {
    const newAccount = isNewAccountSession();
    console.log("CustomerLayout - isNewAccount check:", newAccount);
  }, []);

  const navigation = [
    {
      name: "Dashboard",
      href: "/customer/dashboard",
      icon: Home,
    },
    {
      name: "Cart Status",
      href: "/customer/cart-status",
      icon: ShoppingCart,
    },
    {
      name: "Report Issue",
      href: "/customer/report-issue",
      icon: AlertTriangle,
    },
    {
      name: "Settings",
      href: "/customer/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = () => {
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
    navigate("/");
  };

  // NavLinks component
  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all hover:bg-primary-50",
            location.pathname === item.href
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-gray-700 hover:text-gray-900"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-4 py-3 text-gray-700 hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
        <Link to="/customer/dashboard" className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="font-semibold text-gray-900">CartCareHub</span>
        </Link>
        
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between mb-4">
                  <Link to="/customer/dashboard" className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-gray-900">CartCareHub</span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="hidden md:block">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </nav>
        )}
      </header>
      
      <div className="flex">
        {(!isMobile || isOpen) && (
          <nav className="hidden border-r bg-white md:block md:w-72">
            <div className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4">
              <div className="flex-1">
                <NavLinks />
              </div>
            </div>
          </nav>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default CustomerLayout;
