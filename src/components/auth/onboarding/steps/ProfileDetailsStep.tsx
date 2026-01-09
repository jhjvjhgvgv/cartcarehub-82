import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileDetailsStepProps {
  onComplete: () => void;
  userRole: 'store' | 'maintenance';
}

interface ProfileFormData {
  full_name: string;
  phone: string;
}

export const ProfileDetailsStep = ({ onComplete, userRole }: ProfileDetailsStepProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      full_name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Check if user has org membership (should be created by trigger)
      const { data: memberships, error: membershipError } = await supabase
        .from('org_memberships')
        .select('id, org_id')
        .eq('user_id', user.id)
        .limit(1);

      if (membershipError) {
        console.error('Error checking memberships:', membershipError);
      }

      // If no membership exists, create org via RPC (fallback for existing users)
      if (!memberships || memberships.length === 0) {
        console.log('No membership found, creating org via RPC...');
        
        const orgType = userRole === 'maintenance' ? 'provider' : 'store';
        const ownerRole = userRole === 'maintenance' ? 'provider_admin' : 'store_admin';
        
        const { error: orgError } = await supabase.rpc('create_org_with_owner', {
          p_type: orgType,
          p_name: `${data.full_name}'s Organization`,
          p_owner_role: ownerRole,
        });
        
        if (orgError) {
          console.error('Error creating org:', orgError);
        } else {
          console.log('Org created successfully via RPC');
        }
      }

      // Update onboarding status
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .update({
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (onboardingError) {
        console.error('Error updating onboarding:', onboardingError);
      }

      // Try to send welcome email (non-blocking)
      try {
        await supabase.functions.invoke('welcome-email', {
          body: {
            email: user.email,
            name: data.full_name,
            role: userRole,
          },
        });
      } catch (emailError) {
        console.warn('Welcome email not sent:', emailError);
        // Don't fail the step if email fails
      }

      toast.success('Profile updated successfully!');
      onComplete();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          {userRole === 'store'
            ? 'Tell us about yourself so we can personalize your experience'
            : 'Tell us about yourself'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              rules={{ required: 'Full name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{
                pattern: {
                  value: /^[\d\s\-\+\(\)]+$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
