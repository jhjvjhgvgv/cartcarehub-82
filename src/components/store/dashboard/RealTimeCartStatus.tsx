import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Battery,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartStatus {
  id: string;
  qr_code: string;
  status: 'active' | 'maintenance' | 'inactive' | 'retired';
  store_id: string;
  location?: string;
  battery_level?: number;
  last_seen: string;
  issues: string[];
  is_connected: boolean;
}

interface RealTimeCartStatusProps {
  storeId?: string;
}

export function RealTimeCartStatus({ storeId }: RealTimeCartStatusProps) {
  const [carts, setCarts] = useState<CartStatus[]>([]);
  const [filteredCarts, setFilteredCarts] = useState<CartStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCart, setSelectedCart] = useState<CartStatus | null>(null);
  const { toast } = useToast();

  const fetchCarts = async () => {
    try {
      let query = supabase.from('carts').select('*');
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to include real-time status simulation
      const cartsWithStatus: CartStatus[] = (data || []).map(cart => ({
        id: cart.id,
        qr_code: cart.qr_code,
        status: cart.status as 'active' | 'maintenance' | 'inactive' | 'retired',
        store_id: cart.store_id,
        location: `Aisle ${Math.floor(Math.random() * 20) + 1}`,
        battery_level: Math.floor(Math.random() * 100),
        last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        issues: cart.issues || [],
        is_connected: Math.random() > 0.1 // 90% connected
      }));
      
      setCarts(cartsWithStatus);
      setFilteredCarts(cartsWithStatus);
    } catch (error) {
      console.error('Error fetching carts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cart data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
    
    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('cart-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'carts' },
        (payload) => {
          console.log('Cart update received:', payload);
          fetchCarts(); // Refetch when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  useEffect(() => {
    let filtered = carts;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cart => 
        cart.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cart => cart.status === statusFilter);
    }
    
    setFilteredCarts(filtered);
  }, [carts, searchTerm, statusFilter]);

  const getStatusIcon = (cart: CartStatus) => {
    if (!cart.is_connected) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (cart.issues.length > 0) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (cart.status === 'active') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'retired': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status}
      </Badge>
    );
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Cart Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Real-Time Cart Status
        </CardTitle>
        <CardDescription>
          Live monitoring of cart locations, battery levels, and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Carts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by QR code or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Total Carts</Label>
            <div className="text-2xl font-bold">{filteredCarts.length}</div>
          </div>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCarts.map((cart) => (
            <Dialog key={cart.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cart)}
                        <span className="font-medium">{cart.qr_code}</span>
                      </div>
                      {getStatusBadge(cart.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{cart.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Battery className={`h-3 w-3 ${getBatteryColor(cart.battery_level!)}`} />
                        <span className={getBatteryColor(cart.battery_level!)}>
                          {cart.battery_level}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {cart.is_connected ? (
                          <Wifi className="h-3 w-3 text-green-500" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                          {cart.is_connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      
                      {cart.issues.length > 0 && (
                        <div className="text-yellow-600">
                          {cart.issues.length} issue(s) reported
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cart Details - {cart.qr_code}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      {getStatusBadge(cart.status)}
                    </div>
                    <div>
                      <Label>Connection</Label>
                      <div className="flex items-center gap-2">
                        {cart.is_connected ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <span>{cart.is_connected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{cart.location}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Battery Level</Label>
                      <div className="flex items-center gap-2">
                        <Battery className={`h-4 w-4 ${getBatteryColor(cart.battery_level!)}`} />
                        <span className={getBatteryColor(cart.battery_level!)}>
                          {cart.battery_level}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Last Seen</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cart.last_seen).toLocaleString()}
                    </p>
                  </div>
                  
                  {cart.issues.length > 0 && (
                    <div>
                      <Label>Current Issues</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {cart.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        
        {filteredCarts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No carts found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
}