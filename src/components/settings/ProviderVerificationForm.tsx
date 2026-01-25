import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, ArrowLeft } from "lucide-react";

const verificationSchema = z.object({
  license_number: z.string().min(1, "License number is required"),
  insurance_provider: z.string().min(1, "Insurance provider is required"),
  service_description: z.string().min(10, "Please provide a description of your services (min 10 characters)"),
  service_areas: z.string().min(1, "Please specify your service areas"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface ProviderVerificationFormProps {
  orgId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingData?: {
    id: string;
    license_number: string | null;
    insurance_provider: string | null;
    service_description: string | null;
  } | null;
}

export const ProviderVerificationForm: React.FC<ProviderVerificationFormProps> = ({
  orgId,
  onSuccess,
  onCancel,
  existingData,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      license_number: existingData?.license_number || "",
      insurance_provider: existingData?.insurance_provider || "",
      service_description: existingData?.service_description || "",
      service_areas: "",
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const serviceAreasArray = data.service_areas
        .split(",")
        .map((area) => area.trim())
        .filter((area) => area.length > 0);

      if (existingData?.id) {
        // Update existing verification
        const { error } = await supabase
          .from('provider_verifications')
          .update({
            license_number: data.license_number,
            insurance_provider: data.insurance_provider,
            service_description: data.service_description,
            service_areas: serviceAreasArray,
            status: 'pending',
            rejection_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Insert new verification
        const { error } = await supabase
          .from('provider_verifications')
          .insert({
            org_id: orgId,
            user_id: user.id,
            license_number: data.license_number,
            insurance_provider: data.insurance_provider,
            service_description: data.service_description,
            service_areas: serviceAreasArray,
            status: 'pending',
          });

        if (error) throw error;
      }

      // Update onboarding status
      await supabase
        .from('user_onboarding')
        .update({ 
          verification_submitted: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Verification
            </CardTitle>
            <CardDescription>
              Submit your business credentials for verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BL-123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your official business license or registration number
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
                  <FormLabel>Insurance Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., State Farm, Allstate" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your business liability insurance provider
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance services you provide..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your maintenance capabilities and experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_areas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Areas</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Los Angeles, Orange County, San Diego"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of areas you service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
