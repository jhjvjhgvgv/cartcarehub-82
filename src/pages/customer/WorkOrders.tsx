import { useEffect, useState, useCallback } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Status = "new" | "scheduled" | "in_progress" | "completed" | "canceled";

interface WO {
  id: string;
  status: Status;
  summary: string | null;
  notes: string | null;
  scheduled_at: string | null;
  created_at: string;
  store_org_id: string;
  source_issue_id: string | null;
  provider_org_id: string | null;
  assigned_to: string | null;
}

interface OrgName { id: string; name: string; }

const statusVariant: Record<Status, "default" | "secondary" | "outline"> = {
  new: "default",
  scheduled: "outline",
  in_progress: "default",
  completed: "secondary",
  canceled: "secondary",
};

export default function StoreWorkOrders() {
  const [orders, setOrders] = useState<WO[]>([]);
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    // RLS scopes rows to accessible stores
    const { data, error } = await supabase
      .from("work_orders")
      .select("id, status, summary, notes, scheduled_at, created_at, store_org_id, source_issue_id, provider_org_id, assigned_to")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: "Failed to load work orders", description: error.message, variant: "destructive" });
      return;
    }
    const rows = (data ?? []) as WO[];
    setOrders(rows);

    const providerIds = Array.from(new Set(rows.map(r => r.provider_org_id).filter(Boolean))) as string[];
    if (providerIds.length) {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", providerIds);
      const map: Record<string, string> = {};
      (orgs ?? []).forEach((o: OrgName) => { map[o.id] = o.name; });
      setProviderNames(map);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
    const channel = supabase
      .channel("store-work-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "work_orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-7 w-7" /> Work Orders
          </h1>
          <p className="text-muted-foreground mt-2">Repairs and maintenance for your stores</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No work orders yet. They'll appear here when issues are reported or maintenance is scheduled.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Recent work orders</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{o.summary || "Work order"}</span>
                      {o.source_issue_id && <Badge variant="outline" className="text-xs">Auto</Badge>}
                    </div>
                    {o.notes && <div className="text-sm text-muted-foreground line-clamp-2">{o.notes}</div>}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(o.created_at), "MMM d, yyyy h:mm a")}
                      {o.provider_org_id && ` · ${providerNames[o.provider_org_id] ?? "Provider"}`}
                      {!o.provider_org_id && " · Unassigned"}
                      {o.scheduled_at && ` · Scheduled ${format(new Date(o.scheduled_at), "MMM d")}`}
                    </div>
                  </div>
                  <Badge variant={statusVariant[o.status]} className="shrink-0 capitalize">
                    {o.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}
