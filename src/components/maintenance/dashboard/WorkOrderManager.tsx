import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle,
  Play,
  Square,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useManagedStores } from "@/hooks/use-managed-stores";

interface WorkOrder {
  id: string;
  store_org_id: string;
  store_name: string;
  provider_org_id?: string;
  assigned_to?: string;
  status: 'new' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  summary?: string;
  notes?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

interface WorkOrderManagerProps {
  providerId?: string;
}

export function WorkOrderManager({ providerId }: WorkOrderManagerProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('new');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrderStoreId, setNewOrderStoreId] = useState('');
  const [newOrderSummary, setNewOrderSummary] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { data: managedStores = [] } = useManagedStores();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch work orders with store info
        const { data: orders, error } = await supabase
          .from('work_orders_with_store')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedOrders: WorkOrder[] = (orders || []).map(wo => ({
          id: wo.id,
          store_org_id: wo.store_org_id,
          store_name: wo.store_name || 'Unknown Store',
          provider_org_id: wo.provider_org_id || undefined,
          assigned_to: wo.assigned_to || undefined,
          status: wo.status as WorkOrder['status'],
          summary: wo.summary || undefined,
          notes: wo.notes || undefined,
          scheduled_at: wo.scheduled_at || undefined,
          created_at: wo.created_at,
          updated_at: wo.updated_at,
        }));

        setWorkOrders(mappedOrders);
        setFilteredOrders(mappedOrders);
      } catch (error) {
        console.error('Error fetching work orders:', error);
        toast({
          title: "Error",
          description: "Failed to load work orders",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [providerId, toast]);

  useEffect(() => {
    let filtered = workOrders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [workOrders, searchTerm, statusFilter]);

  const updateWorkOrderStatus = async (orderId: string, newStatus: WorkOrder['status']) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setWorkOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );
      
      toast({
        title: "Work Order Updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating work order:', error);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'new': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'canceled': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.new}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'new': <Clock className="h-4 w-4 text-gray-500" />,
      'scheduled': <Calendar className="h-4 w-4 text-blue-500" />,
      'in_progress': <Play className="h-4 w-4 text-yellow-500" />,
      'completed': <CheckCircle className="h-4 w-4 text-green-500" />,
      'canceled': <Square className="h-4 w-4 text-red-500" />
    };
    return icons[status as keyof typeof icons] || icons.new;
  };

  const groupedOrders = {
    new: filteredOrders.filter(order => order.status === 'new'),
    scheduled: filteredOrders.filter(order => order.status === 'scheduled'),
    in_progress: filteredOrders.filter(order => order.status === 'in_progress'),
    completed: filteredOrders.filter(order => order.status === 'completed')
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Order Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createWorkOrder = async () => {
    if (!newOrderStoreId) {
      toast({
        title: "Error",
        description: "Please select a store",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert({
          store_org_id: newOrderStoreId,
          summary: newOrderSummary || 'New Work Order',
          notes: newOrderNotes || null,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      const selectedStore = managedStores.find(s => s.id === newOrderStoreId);
      
      setWorkOrders(prev => [{
        id: data.id,
        store_org_id: data.store_org_id,
        store_name: selectedStore?.name || 'Unknown Store',
        status: data.status as WorkOrder['status'],
        summary: data.summary || undefined,
        notes: data.notes || undefined,
        scheduled_at: data.scheduled_at || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }, ...prev]);

      toast({
        title: "Work Order Created",
        description: "New work order has been created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewOrderStoreId('');
      setNewOrderSummary('');
      setNewOrderNotes('');
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Work Order Manager
            </CardTitle>
            <CardDescription>
              Manage and track maintenance work orders across all locations
            </CardDescription>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Work Order</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store">Store *</Label>
                  <Select value={newOrderStoreId} onValueChange={setNewOrderStoreId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {managedStores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Input
                    id="summary"
                    value={newOrderSummary}
                    onChange={(e) => setNewOrderSummary(e.target.value)}
                    placeholder="Brief description of the work"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    placeholder="Additional details..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createWorkOrder} disabled={isCreating || !newOrderStoreId}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Orders</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by store, summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Status Filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Total Orders</Label>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="new">
              New ({groupedOrders.new.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({groupedOrders.scheduled.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({groupedOrders.in_progress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Complete ({groupedOrders.completed.length})
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(groupedOrders).map(([status, orders]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status} work orders found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <Dialog key={order.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className="font-medium truncate max-w-[150px]">
                                  {order.summary || 'Work Order'}
                                </span>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{order.store_name}</span>
                              </div>
                              
                              {order.scheduled_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>{format(new Date(order.scheduled_at), 'MMM dd, HH:mm')}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>Created {format(new Date(order.created_at), 'MMM dd')}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Work Order Details</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Store</Label>
                              <p>{order.store_name}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              {getStatusBadge(order.status)}
                            </div>
                            <div>
                              <Label>Summary</Label>
                              <p>{order.summary || 'No summary'}</p>
                            </div>
                            {order.scheduled_at && (
                              <div>
                                <Label>Scheduled</Label>
                                <p>{format(new Date(order.scheduled_at), 'PPP at p')}</p>
                              </div>
                            )}
                          </div>
                          
                          {order.notes && (
                            <div>
                              <Label>Notes</Label>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-4">
                            {order.status === 'new' && (
                              <Button onClick={() => updateWorkOrderStatus(order.id, 'scheduled')}>
                                Schedule
                              </Button>
                            )}
                            {order.status === 'scheduled' && (
                              <Button onClick={() => updateWorkOrderStatus(order.id, 'in_progress')}>
                                Start Work
                              </Button>
                            )}
                            {order.status === 'in_progress' && (
                              <Button onClick={() => updateWorkOrderStatus(order.id, 'completed')}>
                                Complete
                              </Button>
                            )}
                            {order.status !== 'canceled' && order.status !== 'completed' && (
                              <Button 
                                variant="destructive" 
                                onClick={() => updateWorkOrderStatus(order.id, 'canceled')}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
