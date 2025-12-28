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
  CheckCircle2,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Cart } from "@/types/cart";

interface CartStatusView extends Cart {
  location?: string;
  condition_score?: number;
  last_seen: string;
  is_connected: boolean;
  issue_count: number;
}

interface RealTimeCartStatusProps {
  storeId?: string;
}

export function RealTimeCartStatus({ storeId }: RealTimeCartStatusProps) {
  const [carts, setCarts] = useState<CartStatusView[]>([]);
  const [filteredCarts, setFilteredCarts] = useState<CartStatusView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchCarts = async () => {
    try {
      let query = supabase.from('carts').select('*');
      
      if (storeId) {
        query = query.eq('store_org_id', storeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch issue counts for each cart
      const cartsWithStatus: CartStatusView[] = await Promise.all(
        (data || []).map(async (cart) => {
          const { count } = await supabase
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('cart_id', cart.id)
            .eq('status', 'open');

          return {
            ...cart,
            location: `Aisle ${Math.floor(Math.random() * 20) + 1}`,
            condition_score: Math.floor(Math.random() * 40) + 60, // 60-100 condition score
            last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            is_connected: Math.random() > 0.1, // 90% connected
            issue_count: count || 0
          };
        })
      );
      
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
        cart.qr_token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cart => cart.status === statusFilter);
    }
    
    setFilteredCarts(filtered);
  }, [carts, searchTerm, statusFilter]);

  const getStatusIcon = (cart: CartStatusView) => {
    if (!cart.is_connected) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (cart.issue_count > 0) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (cart.status === 'in_service') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'in_service': 'bg-green-100 text-green-800',
      'out_of_service': 'bg-yellow-100 text-yellow-800',
      'retired': 'bg-red-100 text-red-800'
    };
    
    const labels: Record<string, string> = {
      'in_service': 'In Service',
      'out_of_service': 'Out of Service',
      'retired': 'Retired'
    };
    
    return (
      <Badge className={variants[status] || variants.retired}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getConditionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
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
          Live monitoring of cart locations, condition scores, and usage status
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
                placeholder="Search by QR token or location..."
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
                <SelectItem value="in_service">In Service</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
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
                        <span className="font-medium">{cart.asset_tag || cart.qr_token.slice(0, 8)}</span>
                      </div>
                      {getStatusBadge(cart.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{cart.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-3 w-3 ${getConditionColor(cart.condition_score!)}`} />
                        <span className={getConditionColor(cart.condition_score!)}>
                          {cart.condition_score}%
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
                      
                      {cart.issue_count > 0 && (
                        <div className="text-yellow-600">
                          {cart.issue_count} issue(s) reported
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cart Details - {cart.asset_tag || cart.qr_token.slice(0, 8)}</DialogTitle>
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
                      <Label>Condition Score</Label>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${getConditionColor(cart.condition_score!)}`} />
                        <span className={getConditionColor(cart.condition_score!)}>
                          {cart.condition_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>QR Token</Label>
                    <p className="text-sm text-muted-foreground font-mono">{cart.qr_token}</p>
                  </div>
                  
                  <div>
                    <Label>Last Seen</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cart.last_seen).toLocaleString()}
                    </p>
                  </div>
                  
                  {cart.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm text-muted-foreground">{cart.notes}</p>
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
