import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, Home, Settings } from "lucide-react";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-16 items-center border-b px-4 md:px-6">
        <Link to="/customer" className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-semibold">CartCareHub Customer</span>
        </Link>
      </div>
      <div className="flex">
        <nav className="hidden border-r bg-muted/40 md:block md:w-64">
          <div className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
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
          </div>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default CustomerLayout;