
# Next: Onboarding → Notifications → Security

Three phases, shipped in order. Each phase is independently useful — you can stop after any of them.

---

## Phase 1 — Onboarding & role assignment

**Problem.** 13 users have no `org_memberships` row, so RLS hides everything from them. Signup creates the auth user + profile, but the org/membership step (`safe_user_setup`) isn't reliably firing, and there's no admin way to fix orphans in bulk.

**What I'll build**

1. **Backfill script (one-shot SQL via insert tool)** — for every `auth.users` row with no membership, call `safe_user_setup(user_id)` so each orphan gets a default org + membership based on their signup metadata role. Report how many were fixed.
2. **Orphan panel in the corp admin page** — new section in `OrgMembershipManager` that lists "Users without any membership" with a one-click **Auto-setup** button (calls `safe_user_setup`) and the existing **Assign** button as a manual fallback.
3. **Signup hardening** — after `signUp`/OAuth callback, always call `safe_user_setup` client-side once the session is live; today it's only called from one path (`account-templates.ts`). Ensures new users can never land in the app membership-less.
4. **Post-login routing fix** — if a signed-in user has zero memberships, route them to a small "Awaiting setup" screen with a "Try auto-setup" button instead of dropping them into an empty portal.

**Deliverables:** 1 migration-tool insert (backfill), edits to `OrgMembershipManager.tsx`, `use-org-admin.tsx` (new orphan query + mutation), `signInService.ts` / OAuth callback, one new `PendingSetup.tsx` page, `ProtectedRoute.tsx` guard.

---

## Phase 2 — Notifications hub

**What I'll build**

1. **`notifications` table** (id, user_id, type, title, body, link, read_at, created_at, metadata jsonb) with RLS `user_id = auth.uid()` for select/update, `service_role` insert. Added to `supabase_realtime` publication.
2. **Trigger-based producers** — extend the existing `notify_work_order_assigned` pattern so it also inserts a notification row (not just email). Add triggers for: work-order status change, new high/critical issue on a store the user can access.
3. **Bell UI** in `DashboardLayout` and `CustomerLayout` headers — unread count badge, dropdown list, "mark all read", realtime subscription via `supabase.channel`.
4. **`/notifications` page** — full list with filters (unread / all / by type) and links back to the source WO or issue.

**Deliverables:** 1 migration (table + triggers + publication), `NotificationBell.tsx`, `useNotifications` hook, `Notifications.tsx` page, route + sidebar entries.

---

## Phase 3 — Security cleanup

**What I'll build**

1. Run `supabase--linter` + `security--run_security_scan`, capture the current list.
2. Add `SET search_path = public` to every SECURITY DEFINER function still missing it (already correct on most, but a handful of older ones need it).
3. Review any `SECURITY DEFINER` views flagged and rewrite as regular views + policies, or convert to functions with explicit checks.
4. Tighten any policies flagged as overly permissive.
5. Re-run linter/scan and report the delta.

**Deliverables:** 1 migration with function/view fixes, a short before/after summary.

---

## Approach

I'll do them in order. After each phase I'll pause so you can smoke-test in the preview before I move on. Reply "go" to start Phase 1.
