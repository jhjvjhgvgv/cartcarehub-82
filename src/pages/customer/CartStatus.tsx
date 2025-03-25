
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Battery, MapPin, AlertTriangle, ScanLine, Filter, SortDesc } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { QRScanner } from "@/components/cart-form/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { Cart } from "@/types/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const mockCarts: Cart[] = [
  {
    id: "CART-001",
    qr_code: "QR-123456789", 
    status: "active",
    store: "SuperMart Downtown",
    storeId: "store1",
    store_id: "store1", // Added store_id
    lastMaintenance: "2024-03-15",
    issues: [],
  },
  {
    id: "CART-002",
    qr_code: "QR-987654321", 
    status: "maintenance",
    store: "SuperMart Downtown",
    storeId: "store1",
    store_id: "store1", // Added store_id
    lastMaintenance: "2024-03-14",
    issues: ["Wheel alignment needed"],
  },
];

const CartStatus = () => {
  const [carts, setCarts] = useState<Cart[]>(mockCarts);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  // Filter and sort carts
  const filteredAndSortedCarts = useMemo(() => {
    // Filter by search query and status
    let result = carts.filter(cart => {
      const matchesSearch = 
        cart.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.store.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || cart.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    return result.sort((a, b) => {
      let comparison = 0;
      
      // Handle different sort fields
      switch (sortBy) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "store":
          comparison = a.store.localeCompare(b.store);
          break;
        case "lastMaintenance":
          comparison = (a.lastMaintenance || "").localeCompare(b.lastMaintenance || "");
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort order
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [carts, searchQuery, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      case "retired":
        return <Badge variant="secondary">Retired</Badge>;
    }
  };

  const handleQRCodeDetected = (qrCode: string) => {
    const cart = carts.find(c => c.qr_code === qrCode); // Updated from rfidTag to qr_code
    if (cart) {
      toast({
        title: "Cart Found",
        description: `Found cart #${cart.id} at ${cart.store}`,
      });
    } else {
      toast({
        title: "Cart Not Found",
        description: "No cart found with this QR code.",
        variant: "destructive",
      });
    }
    setIsScanning(false);
  };

  const handleSubmit = (data: any) => {
    const newCart: Cart = {
      ...data,
      storeId: "store1",
      issues: Array.isArray(data.issues) ? data.issues : [],
    };
    setCarts([...carts, newCart]);
    toast({
      title: "Success",
      description: "Cart details have been updated.",
    });
  };

  const handleDelete = (cartId: string) => {
    setCarts(carts.filter(cart => cart.id !== cartId));
    toast({
      title: "Success",
      description: "Cart has been removed.",
      variant: "destructive",
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your Carts</h1>
            <p className="text-muted-foreground">
              View detailed information about all shopping carts.
            </p>
          </div>
          <div className="flex gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Carts</h4>
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search by ID or QR code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Sort by</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="sortBy">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Cart ID</SelectItem>
                          <SelectItem value="store">Store</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="lastMaintenance">Last Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={sortOrder} 
                        onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                      >
                        <SelectTrigger id="sortOrder">
                          <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSortBy("id");
                        setSortOrder("asc");
                      }}
                    >
                      Reset
                    </Button>
                    <Button onClick={() => setIsFilterOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={() => setIsScanning(true)} className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </div>

        {filteredAndSortedCarts.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No carts found matching your filters.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedCarts.map((cart) => (
                <Card key={cart.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Cart #{cart.id}</CardTitle>
                      {getStatusBadge(cart.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Store</p>
                          <p className="text-sm text-muted-foreground">{cart.store}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Maintenance</p>
                          <p className="text-sm text-muted-foreground">{cart.lastMaintenance}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">QR Code</p>
                          <p className="text-sm text-muted-foreground">{cart.qr_code}</p>
                        </div>
                      </div>
                      {cart.issues.length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Issues</p>
                            <ul className="text-sm text-destructive list-disc list-inside">
                              {cart.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <Dialog open={isScanning} onOpenChange={setIsScanning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Cart QR Code</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <QRScanner 
                onQRCodeDetected={handleQRCodeDetected}
                carts={carts}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
};

export default CartStatus;
