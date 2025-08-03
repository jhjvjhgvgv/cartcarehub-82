import React from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building, Calendar, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const UserWelcome = () => {
  const { profile, loading, isMaintenanceUser, isStoreUser } = useUserProfile();

  if (loading || !profile) {
    return null;
  }

  const lastSignIn = profile.last_sign_in 
    ? formatDistanceToNow(new Date(profile.last_sign_in), { addSuffix: true })
    : 'First time';

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              Welcome back{profile.display_name ? `, ${profile.display_name}` : ''}!
            </CardTitle>
            <CardDescription>
              {isMaintenanceUser && "Manage your cart maintenance operations"}
              {isStoreUser && "Monitor your shopping cart status"}
            </CardDescription>
          </div>
          <Badge variant={isMaintenanceUser ? "default" : "secondary"}>
            {isMaintenanceUser ? "Maintenance Provider" : "Store Manager"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.company_name && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.company_name}</span>
            </div>
          )}
          
          {profile.contact_phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.contact_phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Last signed in {lastSignIn}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};