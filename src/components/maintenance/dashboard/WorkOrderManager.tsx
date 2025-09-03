import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInHours } from "date-fns";

interface WorkOrder {
  id: string;
  cart_id: string;
  cart_qr_code: string;
  store_id: string;
  store_name: string;
  request_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  assigned_technician?: string;
  scheduled_date?: string;
  estimated_duration: number;
  actual_duration?: number;
  completion_notes?: string;
  parts_used?: string[];
  cost?: number;
  created_at: string;
  updated_at: string;
  location?: string;
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
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const generateSampleWorkOrders = (): WorkOrder[] => {
    const statuses: WorkOrder['status'][] = ['pending', 'scheduled', 'in_progress', 'completed'];
    const priorities: WorkOrder['priority'][] = ['low', 'medium', 'high', 'critical'];
    const requestTypes = ['Routine Maintenance', 'Repair', 'Inspection', 'Battery Replacement', 'Wheel Alignment'];
    const stores = ['Downtown Store', 'Mall Location', 'Suburb Branch', 'Airport Store'];
    
    return Array.from({ length: 20 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const scheduledDate = addDays(new Date(), Math.floor(Math.random() * 14) - 7);
      
      return {
        id: `wo-${i + 1}`,
        cart_id: `cart-${i + 1}`,
        cart_qr_code: `CART-${String(i + 1).padStart(3, '0')}`,
        store_id: `store-${Math.floor(i / 5) + 1}`,
        store_name: stores[Math.floor(i / 5) % stores.length],
        request_type: requestTypes[Math.floor(Math.random() * requestTypes.length)],
        priority,
        status,
        description: `${requestTypes[Math.floor(Math.random() * requestTypes.length)]} required for cart ${i + 1}`,
        assigned_technician: status !== 'pending' ? `Tech ${Math.floor(Math.random() * 5) + 1}` : undefined,
        scheduled_date: status !== 'pending' ? scheduledDate.toISOString() : undefined,
        estimated_duration: Math.floor(Math.random() * 4) + 1,
        actual_duration: status === 'completed' ? Math.floor(Math.random() * 4) + 1 : undefined,
        completion_notes: status === 'completed' ? 'Work completed successfully' : undefined,
        parts_used: status === 'completed' ? ['Brake pads', 'Oil filter'] : undefined,
        cost: status === 'completed' ? Math.floor(Math.random() * 500) + 100 : undefined,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        location: `Aisle ${Math.floor(Math.random() * 20) + 1}`,
      };
    });
  };

  useEffect(() => {
    const orders = generateSampleWorkOrders();
    setWorkOrders(orders);
    setFilteredOrders(orders);
    setLoading(false);
  }, [providerId]);

  useEffect(() => {
    let filtered = workOrders;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.cart_qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.request_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }
    
    setFilteredOrders(filtered);
  }, [workOrders, searchTerm, statusFilter, priorityFilter]);

  const updateWorkOrderStatus = (orderId: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              updated_at: new Date().toISOString(),
              assigned_technician: newStatus !== 'pending' ? (order.assigned_technician || 'Current User') : order.assigned_technician
            }
          : order
      )
    );
    
    toast({
      title: "Work Order Updated",
      description: `Status changed to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || variants.pending}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[priority] || variants.low}>
        {priority}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': <Clock className="h-4 w-4 text-gray-500" />,
      'scheduled': <Calendar className="h-4 w-4 text-blue-500" />,
      'in_progress': <Play className="h-4 w-4 text-yellow-500" />,
      'completed': <CheckCircle className="h-4 w-4 text-green-500" />,
      'cancelled': <Square className="h-4 w-4 text-red-500" />
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const groupedOrders = {
    pending: filteredOrders.filter(order => order.status === 'pending'),
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Work Order Manager
        </CardTitle>
        <CardDescription>
          Manage and track maintenance work orders across all locations
        </CardDescription>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Orders</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by cart, store, type..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Priority Filter</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Total Orders</Label>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({groupedOrders.pending.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({groupedOrders.scheduled.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({groupedOrders.in_progress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({groupedOrders.completed.length})
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
                                <span className="font-medium">{order.cart_qr_code}</span>
                              </div>
                              {getPriorityBadge(order.priority)}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{order.store_name}</span>
                              </div>
                              
                              <div className="font-medium">{order.request_type}</div>
                              
                              {order.assigned_technician && (
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span>{order.assigned_technician}</span>
                                </div>
                              )}
                              
                              {order.scheduled_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>{format(new Date(order.scheduled_date), 'MMM dd, HH:mm')}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{order.estimated_duration}h estimated</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t">
                              {getStatusBadge(order.status)}
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Work Order Details - {order.cart_qr_code}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Cart</Label>
                              <p>{order.cart_qr_code}</p>
                            </div>
                            <div>
                              <Label>Store</Label>
                              <p>{order.store_name}</p>
                            </div>
                            <div>
                              <Label>Type</Label>
                              <p>{order.request_type}</p>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              {getPriorityBadge(order.priority)}
                            </div>
                            <div>
                              <Label>Status</Label>
                              {getStatusBadge(order.status)}
                            </div>
                            <div>
                              <Label>Duration</Label>
                              <p>{order.estimated_duration}h estimated
                                {order.actual_duration && ` / ${order.actual_duration}h actual`}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground">{order.description}</p>
                          </div>
                          
                          {order.assigned_technician && (
                            <div>
                              <Label>Assigned Technician</Label>
                              <p>{order.assigned_technician}</p>
                            </div>
                          )}
                          
                          {order.scheduled_date && (
                            <div>
                              <Label>Scheduled Date</Label>
                              <p>{format(new Date(order.scheduled_date), 'PPP at p')}</p>
                            </div>
                          )}
                          
                          {order.completion_notes && (
                            <div>
                              <Label>Completion Notes</Label>
                              <p className="text-sm text-muted-foreground">{order.completion_notes}</p>
                            </div>
                          )}
                          
                          {order.parts_used && order.parts_used.length > 0 && (
                            <div>
                              <Label>Parts Used</Label>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {order.parts_used.map((part, index) => (
                                  <li key={index}>{part}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {order.cost && (
                            <div>
                              <Label>Total Cost</Label>
                              <p className="text-lg font-medium">${order.cost}</p>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4 border-t">
                            {order.status === 'pending' && (
                              <Button 
                                onClick={() => updateWorkOrderStatus(order.id, 'scheduled')}
                                size="sm"
                              >
                                Schedule
                              </Button>
                            )}
                            
                            {order.status === 'scheduled' && (
                              <Button 
                                onClick={() => updateWorkOrderStatus(order.id, 'in_progress')}
                                size="sm"
                              >
                                Start Work
                              </Button>
                            )}
                            
                            {order.status === 'in_progress' && (
                              <Button 
                                onClick={() => updateWorkOrderStatus(order.id, 'completed')}
                                size="sm"
                              >
                                Complete
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