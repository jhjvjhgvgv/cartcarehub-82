import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(10);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead()}
            disabled={unreadCount === 0}
            className="h-7 text-xs"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const body = (
                  <div className={cn("space-y-1 p-3", !n.read_at && "bg-primary/5")}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link to={n.link} onClick={() => !n.read_at && markRead(n.id)} className="block hover:bg-muted/50">
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !n.read_at && markRead(n.id)}
                        className="block w-full text-left hover:bg-muted/50"
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/notifications">View all</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
