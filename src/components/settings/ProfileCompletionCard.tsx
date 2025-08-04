import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from "lucide-react";

export const ProfileCompletionCard = () => {
  const { profile, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    email: profile?.email || '',
    company_name: profile?.company_name || '',
    contact_phone: profile?.contact_phone || ''
  });

  const calculateCompletion = () => {
    const fields = [
      profile?.display_name,
      profile?.email,
      profile?.company_name,
      profile?.role
    ];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          email: formData.email,
          company_name: formData.company_name,
          contact_phone: formData.contact_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });

      await refreshProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage === 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion
          </span>
          {isComplete && (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {!isComplete && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile to enable all features and improve connection success rates.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            placeholder="Your company or organization"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
          <Input
            id="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
};