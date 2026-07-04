import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";

export default function PendingSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const runSetup = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("ensure_my_setup");
    setBusy(false);
    if (error) {
      toast({ title: "Setup failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You're set up", description: "Redirecting…" });
    const { data: ctx } = await supabase.rpc("get_my_portal_context");
    const memberships = (ctx as any)?.memberships ?? [];
    const role = memberships[0]?.role ?? "";
    if (role.startsWith("provider_")) navigate("/dashboard", { replace: true });
    else if (role.startsWith("corp_")) navigate("/admin", { replace: true });
    else navigate("/customer/dashboard", { replace: true });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle>Almost there</CardTitle>
          </div>
          <CardDescription>
            Your account ({user?.email}) doesn't belong to any organization yet. Set one up
            now to enter the app, or contact your admin if you were expecting to join an
            existing organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={runSetup} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Auto-create my organization
          </Button>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
