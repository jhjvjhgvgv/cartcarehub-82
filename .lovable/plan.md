
## Combined next sprint — A + B + C

### Phase 1 — DB hardening + work-order lifecycle (one migration)
- Run `supabase--linter`; for each finding, patch in the same migration:
  - Add `set search_path = public` to flagged functions (e.g. `is_member`, `has_role` variants, `user_can_access_store`, `current_user_can_access_store_as_provider`, `provider_has_store_access` — currently missing).
  - Convert any `SECURITY DEFINER` view to `security_invoker = true` or rewrite as a function.
- Add `transition_work_order(p_id uuid, p_to_status text, p_notes text default null)`:
  - Allowed transitions: `new→scheduled→in_progress→completed`; `*→canceled` from non-terminal.
  - Authorization: caller must be `is_corp_admin()` OR member of WO's `provider_org_id` OR `store_admin` of WO's `store_org_id`.
  - On `completed`: if WO linked to a cart, insert `cart_status_events(status='in_service', source='work_order')` and update cart.
  - `security definer`, `set search_path = public`.
- Add `create_work_order_from_issue(p_issue_id uuid)`:
  - Creates a `work_orders` row linked to the issue's `store_org_id` + `cart_id`, status `new`.
  - Returns new WO id.
- Add trigger on `issues` AFTER INSERT WHEN severity in (`high`,`critical`) → call `create_work_order_from_issue`.

### Phase 2 — QR inspection submission UI (#C)
*The RPC `submit_inspection_by_qr` already exists — just build the page.*
- New route `/inspection/:qr_token`:
  - Looks up cart preview via a thin public RPC (or via the protected query post-login).
  - Renders a mechanical-wear checklist (wheels, frame, child seat, handle — no batteries).
  - On submit: call `supabase.rpc('submit_inspection_by_qr', …)` with computed `reported_status`, `health_score`, `checklist`, and optional issue fields.
  - On failed checklist items with severity high/critical, the Phase 1 trigger auto-creates a WO.
- Hook up `QRScannerDialog` to route to `/inspection/:qr_token`.

### Phase 3 — Work order lifecycle UI (#B)
Refactor `src/components/maintenance/dashboard/WorkOrderManager.tsx`:
- Replace direct `.update({ status })` with `supabase.rpc('transition_work_order', …)`; surface RPC errors as toasts.
- Add "Assign provider" action when caller is `corp_admin` or store admin (lists active providers via `provider_store_links`).
- Show link to source issue when WO was auto-created (`work_orders.source_issue_id`).
- Add useEffect-scoped realtime subscription on `work_orders` and `issues` (cleanup with `removeChannel`) → invalidate `react-query` keys + toast on new rows.

### Phase 4 — Manual smoke test (you)
1. `/admin` → Grant me corp_admin → create one store org + one provider org → assign yourself to both.
2. Create a cart with `qr_token` matching `^[A-Z0-9-]{6,}$`.
3. Open `/inspection/<token>` → submit a failing checklist → confirm issue + auto-WO appear.
4. In maintenance portal: schedule → start → complete WO → confirm cart status flips back to `in_service`.

---

## Technical notes
- Single migration file: linter fixes + `transition_work_order` + `create_work_order_from_issue` + `issues` trigger + (if needed) `work_orders.source_issue_id uuid references issues(id)`.
- All new functions: `security definer`, `set search_path = public`, authorization checks inside.
- WorkOrderManager already uses canonical statuses (`new/scheduled/in_progress/completed/canceled`) — keep as is.
- No new tables; reuses `work_orders`, `issues`, `inspections`, `cart_status_events`.
- Phases 1→2→3 are sequenced because Phase 2 trigger depends on Phase 1 function, and Phase 3 UI depends on Phase 1 RPC.

Approve to switch to build mode and I'll execute Phases 1–3.
