import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Shield, Upload, AlertCircle } from 'lucide-react';

interface MaintenanceVerificationStepProps {
  onComplete: () => void;
}

interface VerificationFormData {
  license_number: string;
  insurance_provider: string;
  service_description: string;
  service_areas: string;
}

export const MaintenanceVerificationStep = ({ onComplete }: MaintenanceVerificationStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VerificationFormData>({
    defaultValues: {
      license_number: '',
      insurance_provider: '',
      service_description: '',
      service_areas: '',
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement verification submission when provider verification system is built
      console.log('Verification data:', data);
      
      toast.success('Verification submitted! An admin will review your application.');
      onComplete();
    } catch (error) {
      console.error('Verification submission error:', error);
      toast.error('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="mx-auto mb-4">
          <Shield className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Business Verification</CardTitle>
        <CardDescription className="text-center">
          Help us verify your business to connect with stores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This information helps stores trust your services. An admin will review your submission.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business License Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="BL-123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your state or local business license number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insurance_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Insurance Co." {...field} />
                  </FormControl>
                  <FormDescription>
                    Your liability insurance provider name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_description"
              rules={{ required: 'Service description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="We provide comprehensive shopping cart maintenance including repairs, cleaning, and preventive maintenance..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_areas"
              rules={{ required: 'Service areas are required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Areas *</FormLabel>
                  <FormControl>
                    <Input placeholder="New York, New Jersey, Connecticut" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter states or regions where you provide service (comma-separated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Document Uploads Coming Soon</p>
                <p className="text-xs text-muted-foreground">
                  You'll be able to upload license and insurance documents in a future update
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
