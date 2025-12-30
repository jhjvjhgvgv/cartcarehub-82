import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateMaintenanceRequest } from '@/hooks/use-maintenance';
import { Cart, CartWithStore } from '@/types/cart';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const maintenanceRequestSchema = z.object({
  cart_id: z.string().min(1, 'Cart is required'),
  provider_id: z.string().min(1, 'Provider is required'),
  store_id: z.string().min(1, 'Store is required'),
  request_type: z.enum(['routine', 'emergency', 'inspection', 'repair']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().optional(),
  scheduled_date: z.string().optional(),
  estimated_duration: z.number().optional(),
});

type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;

interface MaintenanceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart?: Cart | CartWithStore;
  carts: (Cart | CartWithStore)[];
}

export const MaintenanceRequestDialog: React.FC<MaintenanceRequestDialogProps> = ({
  open,
  onOpenChange,
  cart,
  carts,
}) => {
  const createRequest = useCreateMaintenanceRequest();
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<MaintenanceRequestFormData>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      cart_id: cart?.id || '',
      store_id: cart?.store_org_id || '',
      request_type: 'routine',
      priority: 'medium',
      estimated_duration: 30,
    },
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get connected maintenance providers
        const { data: connections } = await supabase
          .from('store_provider_connections')
          .select('provider_id, maintenance_providers(id, company_name)')
          .eq('initiated_by', user.id)
          .eq('status', 'accepted');

        setProviders(connections || []);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProviders();
    }
  }, [open]);

  const onSubmit = async (data: MaintenanceRequestFormData) => {
    try {
      if (providers.length === 0) {
        toast({
          title: "No Providers",
          description: "Please connect to a maintenance provider first",
          variant: "destructive"
        });
        return;
      }

      await createRequest.mutateAsync({
        cart_id: data.cart_id!,
        provider_id: data.provider_id!,
        store_id: data.store_id!,
        request_type: data.request_type,
        priority: data.priority,
        status: 'pending',
        description: data.description,
        scheduled_date: data.scheduled_date,
        estimated_duration: data.estimated_duration,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create maintenance request:', error);
    }
  };

  const getCartDisplayName = (cartOption: Cart | CartWithStore) => {
    const storeName = 'store_name' in cartOption ? cartOption.store_name : cartOption.store_org_id;
    return `${cartOption.asset_tag || cartOption.qr_token} - ${storeName || 'Unknown Store'}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>
            Schedule maintenance for your cart. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cart_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cart *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cart" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carts.map((cartOption) => (
                        <SelectItem key={cartOption.id} value={cartOption.id}>
                          {getCartDisplayName(cartOption)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Provider *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>Loading providers...</SelectItem>
                      ) : providers.length === 0 ? (
                        <SelectItem value="none" disabled>No connected providers</SelectItem>
                      ) : (
                        providers.map((conn: any) => (
                          <SelectItem key={conn.provider_id} value={conn.provider_id}>
                            {conn.maintenance_providers?.company_name || 'Unknown Provider'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="request_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="routine">Routine Maintenance</SelectItem>
                      <SelectItem value="emergency">Emergency Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="repair">General Repair</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the maintenance needed..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
