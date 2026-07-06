import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

const KEY = ["notifications"] as const;

export function useNotifications(limit = 50) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, limit],
    queryFn: async (): Promise<AppNotification[]> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      channel = supabase
        .channel(`notifications-${data.user.id}`)
        .on(
          "postgres_changes" as any,
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${data.user.id}`,
          } as any,
          () => {
            qc.invalidateQueries({ queryKey: KEY });
          }
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [qc]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null)
        .eq("user_id", userData.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
}
