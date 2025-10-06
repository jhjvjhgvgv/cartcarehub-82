import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { checkProfileCompletion, createMaintenanceProviderProfile } from "@/services/profile/profile-completion";
import { RoleSyncService } from "@/services/profile/role-sync-service";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const ProfileSetup = () => {
  const { profile, loading, updateProfile, isMaintenanceUser } = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    company_name: profile?.company_name || "",
    contact_phone: profile?.contact_phone || "",
  });

  // Check if profile is already complete and redirect if so
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user?.id) return;
      
      console.log("🔍 Checking profile completion for user:", user.id);
      
      try {
        // Use the safe user setup function
        const { data: setupResult, error: setupError } = await supabase.rpc('safe_user_setup', {
          user_id_param: user.id
        });

        if (setupError) {
          console.error("❌ User setup failed:", setupError);
        } else {
          console.log("✅ User setup completed:", setupResult);
        }
        
        const completion = await checkProfileCompletion(user.id);
        setProfileCompletion(completion);
        
        if (completion.isComplete) {
          console.log("✅ Profile is already complete, redirecting to dashboard");
          const role = profile?.role;
          
          if (role === 'maintenance') {
            navigate('/dashboard', { replace: true });
          } else if (role === 'store') {
            navigate('/customer/dashboard', { replace: true });
          } else if (role === 'admin') {
            navigate('/admin', { replace: true });
          }
        }
      } catch (error) {
        console.error("❌ Error checking profile completion:", error);
        setProfileCompletion({ isComplete: false, missingFields: [] });
      }
    };
    
    if (user && !loading) {
      checkCompletion();
    }
  }, [user, loading, profile?.role, navigate]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        company_name: profile.company_name || "",
        contact_phone: profile.contact_phone || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Validate required fields
      if (!formData.display_name.trim()) {
        toast({
          title: "Error",
          description: "Display name is required.",
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      if (!formData.company_name.trim()) {
        toast({
          title: "Error",
          description: `${isMaintenanceUser ? 'Company' : 'Store'} name is required.`,
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      // First ensure user setup is complete and profile exists
      if (user) {
        try {
          const setupResult = await RoleSyncService.performComprehensiveSync(user.id);
          if (!setupResult.success) {
            console.warn('User setup sync warning:', setupResult.message);
            // Continue anyway - might be a minor issue
          }
        } catch (error) {
          console.error('Error during user setup sync:', error);
          // Continue anyway - we'll try profile update directly
        }
      }

      // Attempt to update the profile
      let success = await updateProfile(formData);
      
      // If update failed and profile doesn't exist, try to create it
      if (!success && user) {
        console.log('Profile update failed, attempting to create profile...');
        
        try {
          // Get the user's role from auth metadata
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const userRole = authUser?.user_metadata?.role || 'store';
          
          // Create profile directly using Supabase
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              display_name: formData.display_name.trim(),
              company_name: formData.company_name.trim(),
              contact_phone: formData.contact_phone.trim() || null,
              role: userRole, // Use role from auth metadata
              is_active: true,
            });

          if (!createError) {
            success = true;
            // Refresh the profile data by refetching
            window.location.reload();
          } else {
            console.error('Failed to create profile:', createError);
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
        }
      }
      
      if (!success) {
        toast({
          title: "Update Failed",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      // If maintenance user, ensure maintenance provider profile exists
      if (isMaintenanceUser && user?.id) {
        try {
          const providerResult = await RoleSyncService.ensureMaintenanceProviderProfile(
            user.id,
            {
              companyName: formData.company_name.trim(),
              contactEmail: user.email || '',
              contactPhone: formData.contact_phone.trim() || undefined,
            }
          );
          
          if (!providerResult.success) {
            console.warn('Failed to create maintenance provider profile:', providerResult.message);
            toast({
              title: "Warning", 
              description: "Profile updated but maintenance provider setup failed. You may need to complete this later.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error creating maintenance provider profile:', error);
        }
      }

      toast({
        title: "Profile Setup Complete",
        description: "Your profile has been set up successfully. Welcome!",
      });

      // Redirect to appropriate dashboard
      const redirectPath = isMaintenanceUser ? '/dashboard' : '/customer/dashboard';
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error("Profile setup error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !profileCompletion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            {isMaintenanceUser 
              ? "Set up your maintenance provider profile to start connecting with stores."
              : "Complete your store profile to connect with maintenance providers."
            }
          </CardDescription>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">
              {isMaintenanceUser ? "Company Name" : "Store Name"}
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder={isMaintenanceUser ? "Enter your company name" : "Enter your store name"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange("contact_phone", e.target.value)}
              placeholder="Enter your contact phone number"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};