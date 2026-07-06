# Phase 2 — Notifications hub

Phase 1 (onboarding + orphan backfill + PendingSetup) is done. Next up is the notifications hub from the roadmap.

## What I'll build

1. **`notifications` table** (migration)
   - Columns: `user_id`, `type`, `title`, `body`, `link`, `metadata jsonb`, `read_at`, plus standard `id/created_at`.
   - RLS: users can `select`/`update` their own rows; `service_role` inserts. `authenticated` gets `select, update`; `service_role` gets `all`.
   - Added to `supabase_realtime` publication so the bell updates live.

2. **Trigger-based producers**
   - Reuse the pattern from `notify_work_order_assigned`: on work-order assignment and on status change, insert a row into `notifications` for the assignee and the store's admins.
   - On new `issues` row with severity `high`/`critical`, notify store admins of that store.
   - All producers are `SECURITY DEFINER` with `search_path = public`.

3. **Bell UI in headers**
   - New `NotificationBell.tsx` used in both `DashboardLayout` and `CustomerLayout`.
   - Shows unread count badge, dropdown of latest 10, "Mark all read", link to each item's `link`.
   - Realtime subscription via `supabase.channel` inside `useEffect` with proper cleanup (per realtime rule).

4. **`/notifications` page + route**
   - Full list with filters (unread / all / by type).
   - New `useNotifications` hook wrapping the queries + mutations.
   - Route added to `AppRoutes.tsx` behind `ProtectedRoute`; sidebar entries in both layouts.

## Deliverables

- 1 migration (table + grants + RLS + triggers + publication)
- `src/hooks/use-notifications.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/pages/Notifications.tsx`
- Edits to `DashboardLayout.tsx`, `CustomerLayout.tsx`, `AppRoutes.tsx`

After Phase 2 lands I'll pause so you can smoke-test, then move to Phase 3 (security cleanup: linter fixes, `search_path` sweep, SECURITY DEFINER view review).

Reply **go** to start.
