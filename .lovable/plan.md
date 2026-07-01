## Next Step: Close the loop — Notifications + Provider Portal Polish

The backend lifecycle (QR → inspection → auto work-order → provider assignment) is live, but three gaps prevent day-to-day usability:

1. **Providers don't know when work is assigned to them.** No push, no email, no in-app alert.
2. **The "My Work Orders" filter is buried** in a checkbox on a shared manager UI. Providers need a dedicated landing view.
3. **Store admins have no visibility** into the auto-created work orders spawned from their inspections.

### What to build

**A. Assignment notifications (backend)**
- New edge function `notify-work-order-assigned` (uses existing Resend + `noreply@cartrepairpros.com`).
- DB trigger on `work_orders` AFTER UPDATE OF `assigned_to` → invokes edge function with WO details + assignee email.
- Also fires on INSERT when `assigned_to` is set at creation.

**B. Provider landing view**
- New route `/provider/queue` (reuses `ProtectedRoute` with `allowedRole="maintenance"`).
- Shows only WOs where `assigned_to = auth.uid()`, grouped by status (New → Scheduled → In Progress).
- Quick-action buttons wired to `transition_work_order` RPC.
- Add nav entry in maintenance portal sidebar.

**C. Store admin work-order visibility**
- New tab "Work Orders" on the store dashboard (`src/pages/customer/Dashboard.tsx` or dedicated route).
- Read-only list filtered by `store_org_id = <current store>`.
- Shows status + assigned provider name + source issue link.

### Technical notes
- Single migration: notification trigger only.
- One edge function deploy: `notify-work-order-assigned`.
- Three new/edited frontend files: provider queue page, store WO tab, sidebar nav entry.
- No schema changes — reuses `work_orders`, `org_memberships`, existing views.

### Out of scope (later sprints)
- SMS notifications
- Real-time push (browser notifications API)
- Provider mobile app / Capacitor build

Approve to switch to build mode and I'll ship A + B + C together.
