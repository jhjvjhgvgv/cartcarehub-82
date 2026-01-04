import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';

interface StoreLocationStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface StoreFormData {
  store_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export const StoreLocationStep = ({ onComplete, onSkip }: StoreLocationStepProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StoreFormData>({
    defaultValues: {
      store_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  const onSubmit = async (data: StoreFormData) => {
    if (!user) {
      toast.error('User not found. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user's org membership
      const { data: membership, error: membershipError } = await supabase
        .from('org_memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('role', 'store_admin')
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        throw membershipError;
      }

      if (membership?.org_id) {
        // Update the organization with store details
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: data.store_name,
            market: data.city,
            region: data.state,
            settings: {
              address: data.address,
              city: data.city,
              state: data.state,
              zip_code: data.zip_code,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', membership.org_id);

        if (updateError) {
          console.error('Error updating organization:', updateError);
          throw updateError;
        }

        toast.success('Store location added successfully!');
      } else {
        console.warn('No store membership found for user');
        toast.success('Store details saved!');
      }

      onComplete();
    } catch (error) {
      console.error('Store creation error:', error);
      toast.error('Failed to add store location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="mx-auto mb-4">
          <MapPin className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Add Your First Store Location</CardTitle>
        <CardDescription className="text-center">
          This will help you manage your shopping carts more effectively
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="store_name"
              rules={{ required: 'Store name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Street Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              rules={{ required: 'Address is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zip_code"
              rules={{
                required: 'ZIP code is required',
                pattern: {
                  value: /^\d{5}(-\d{4})?$/,
                  message: 'Invalid ZIP code format',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="10001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onSkip} className="flex-1">
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Location'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
