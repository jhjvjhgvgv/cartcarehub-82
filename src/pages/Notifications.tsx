import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, isLoading } = useNotifications(200);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const filtered = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.read_at) : notifications),
    [notifications, filter]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No notifications.
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => {
            const inner = (
              <Card className={cn("p-4", !n.read_at && "border-primary/40 bg-primary/5")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} · {n.type}
                    </p>
                  </div>
                  {!n.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
              </Card>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link to={n.link} onClick={() => !n.read_at && markRead(n.id)} className="block">
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => !n.read_at && markRead(n.id)}
                    className="block w-full text-left"
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
