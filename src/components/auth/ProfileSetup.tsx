import React, { useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const ProfileSetup = () => {
  const { profile, loading, updateProfile, isMaintenanceUser } = useUserProfile();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    company_name: profile?.company_name || "",
    contact_phone: profile?.contact_phone || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const success = await updateProfile(formData);
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
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
  );
};