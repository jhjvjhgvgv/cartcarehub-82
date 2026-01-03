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
import { useCreateWorkOrder } from '@/hooks/use-maintenance';
import { Cart, CartWithStore } from '@/types/cart';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const workOrderSchema = z.object({
  store_org_id: z.string().min(1, 'Store is required'),
  provider_org_id: z.string().optional(),
  summary: z.string().min(1, 'Summary is required'),
  notes: z.string().optional(),
  scheduled_at: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

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
  const createWorkOrder = useCreateWorkOrder();
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      store_org_id: cart?.store_org_id || '',
      summary: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const storeOrgId = cart?.store_org_id;
        if (!storeOrgId) {
          setLoading(false);
          return;
        }

        // Get connected maintenance providers via provider_store_links
        const { data: links } = await supabase
          .from('provider_store_links')
          .select('provider_org_id')
          .eq('store_org_id', storeOrgId)
          .eq('status', 'active');

        if (links && links.length > 0) {
          const providerIds = links.map(l => l.provider_org_id);
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', providerIds);
          
          setProviders(orgs || []);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProviders();
    }
  }, [open, cart?.store_org_id]);

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      await createWorkOrder.mutateAsync({
        store_org_id: data.store_org_id,
        provider_org_id: data.provider_org_id || undefined,
        summary: data.summary,
        notes: data.notes,
        scheduled_at: data.scheduled_at,
        status: 'new',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create work order:', error);
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
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Create a new maintenance work order. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="store_org_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carts.map((cartOption) => (
                        <SelectItem key={cartOption.id} value={cartOption.store_org_id}>
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
              name="provider_org_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>Loading providers...</SelectItem>
                      ) : providers.length === 0 ? (
                        <SelectItem value="none" disabled>No connected providers</SelectItem>
                      ) : (
                        providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
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
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary *</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the work needed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_at"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details..."
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
                disabled={createWorkOrder.isPending}
              >
                {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
