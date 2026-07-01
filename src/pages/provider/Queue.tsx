import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardList, Play, CheckCircle, Calendar, AlertCircle } from "lucide-react";
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
}

const statusMeta: Record<Status, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  scheduled: { label: "Scheduled", color: "bg-yellow-500" },
  in_progress: { label: "In Progress", color: "bg-purple-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  canceled: { label: "Canceled", color: "bg-gray-500" },
};

export default function ProviderQueue() {
  const [orders, setOrders] = useState<WO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("work_orders")
      .select("id, status, summary, notes, scheduled_at, created_at, store_org_id, source_issue_id")
      .eq("assigned_to", uid)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load queue", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((data ?? []) as WO[]);
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) { setLoading(false); return; }
      setUserId(user.id);
      await fetchOrders(user.id);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchOrders]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`provider-queue-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "work_orders", filter: `assigned_to=eq.${userId}` }, () => {
        fetchOrders(userId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchOrders]);

  const transition = async (id: string, to: Status) => {
    const { error } = await supabase.rpc("transition_work_order", {
      p_work_order_id: id,
      p_to_status: to,
    });
    if (error) {
      toast({ title: "Transition failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Marked ${statusMeta[to].label}` });
    if (userId) fetchOrders(userId);
  };

  const grouped: Record<Status, WO[]> = {
    new: [], scheduled: [], in_progress: [], completed: [], canceled: [],
  };
  orders.forEach(o => grouped[o.status]?.push(o));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderSection = (status: Status, actions: (o: WO) => React.ReactNode) => {
    const list = grouped[status];
    if (list.length === 0) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusMeta[status].color}`} />
            {statusMeta[status].label}
            <Badge variant="secondary">{list.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.map(o => (
            <div key={o.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.summary || "Work order"}</div>
                {o.notes && <div className="text-sm text-muted-foreground line-clamp-2">{o.notes}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  Created {format(new Date(o.created_at), "MMM d, h:mm a")}
                  {o.scheduled_at && ` · Scheduled ${format(new Date(o.scheduled_at), "MMM d")}`}
                  {o.source_issue_id && " · From reported issue"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">{actions(o)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-7 w-7" /> My Queue
          </h1>
          <p className="text-muted-foreground mt-2">Work orders assigned to you</p>
        </div>

        {orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No work orders assigned to you yet.
            </CardContent>
          </Card>
        )}

        {renderSection("new", (o) => (
          <>
            <Button size="sm" variant="outline" onClick={() => transition(o.id, "scheduled")}>
              <Calendar className="h-4 w-4 mr-1" /> Schedule
            </Button>
            <Button size="sm" onClick={() => transition(o.id, "in_progress")}>
              <Play className="h-4 w-4 mr-1" /> Start
            </Button>
          </>
        ))}
        {renderSection("scheduled", (o) => (
          <Button size="sm" onClick={() => transition(o.id, "in_progress")}>
            <Play className="h-4 w-4 mr-1" /> Start
          </Button>
        ))}
        {renderSection("in_progress", (o) => (
          <Button size="sm" onClick={() => transition(o.id, "completed")}>
            <CheckCircle className="h-4 w-4 mr-1" /> Complete
          </Button>
        ))}
        {renderSection("completed", () => null)}
      </div>
    </DashboardLayout>
  );
}
