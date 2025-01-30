import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, Home, Settings, Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/customer",
      icon: Home,
    },
    {
      name: "Cart Status",
      href: "/customer/cart-status",
      icon: ShoppingCart,
    },
    {
      name: "Report Issue",
      href: "/customer/report",
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

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            location.pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-3"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link to="/customer" className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-semibold">CartCareHub</span>
        </Link>
        
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="flex flex-col gap-2">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
      
      <div className="flex">
        <nav className="hidden border-r bg-muted/40 md:block md:w-64">
          <div className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4">
            <div className="flex-1">
              <NavLinks />
            </div>
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default CustomerLayout;