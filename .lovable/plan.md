
# Complete Plan: Making Cart Care Hub Fully Functional and Live

## Current State Analysis

### Database Status
| Table | Records | Notes |
|-------|---------|-------|
| organizations | 9 | 6 stores, 3 providers |
| org_memberships | 7 | 4 store_admin, 3 provider_admin |
| user_profiles | 7 | User profiles exist |
| carts | 0 | **No carts - app needs data** |
| inspections | 0 | No inspection history |
| issues | 0 | No tracked issues |
| work_orders | 0 | No work orders |
| provider_store_links | 0 | **No connections between stores and providers** |
| provider_verifications | 1 | 1 pending verification |

### Critical Issues Identified

1. **Admin Edge Function Uses Deprecated Table**: `admin-management/index.ts` queries `profiles` table (lines 49, 116, 141) which doesn't exist - should use `org_memberships` + `user_profiles`

2. **No Corp Admin User**: No user has `corp_admin` role, so `/admin` page cannot be accessed

3. **Hardcoded Sample Stores**: `src/constants/stores.ts` has fake store data used in Carts page instead of real database stores

4. **ConnectionStatusDisplay Stuck Loading**: Uses deprecated `ConnectionService` methods that query legacy data

5. **No Store-Provider Connections**: `provider_store_links` is empty, so stores and providers can't collaborate

---

## Phase 1: Fix Admin System (Critical)

### 1.1 Create Corp Admin User
- Create a database migration to:
  - Create a `corporation` type organization for the platform
  - Create `corp_admin` membership for an existing user OR new admin user

### 1.2 Fix Admin Management Edge Function
Update `supabase/functions/admin-management/index.ts` to use the canonical schema:

**Current (broken):**
```typescript
const { data: profile } = await supabaseClient
  .from('profiles')  // Table doesn't exist!
  .select('role')
  .eq('id', user.id)
```

**Fixed:**
```typescript
const { data: membership } = await supabaseClient
  .from('org_memberships')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'corp_admin')
  .maybeSingle()

if (!membership) {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403, headers: corsHeaders }
  )
}
```

Also update `get_users` action to query `user_profiles` joined with `org_memberships` instead of deprecated `profiles`.

### 1.3 Update get_admin_dashboard_stats RPC
Ensure the `get_admin_dashboard_stats` function returns data matching the `AdminDashboardStats` interface with proper aggregations from the canonical schema.

---

## Phase 2: Remove Hardcoded Sample Data

### 2.1 Delete Sample Stores Constant
Remove `src/constants/stores.ts` and all references to `managedStores`

### 2.2 Update Carts Page
Modify `src/pages/Carts.tsx` to fetch stores from database:
```typescript
// Instead of importing managedStores
const { data: stores } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('type', 'store')
```

### 2.3 Update CartDialog and CartListSection
Pass real database stores instead of hardcoded array.

---

## Phase 3: Fix Connection System

### 3.1 Fix ConnectionStatusDisplay
Update `src/components/settings/ConnectionStatusDisplay.tsx` to use `provider_store_links` table directly:

```typescript
// For maintenance users
const { data: links } = await supabase
  .from('provider_store_links')
  .select('*, store:store_org_id(name)')
  .eq('provider_org_id', userOrgId)

// For store users  
const { data: links } = await supabase
  .from('provider_store_links')
  .select('*, provider:provider_org_id(name)')
  .eq('store_org_id', userOrgId)
```

### 3.2 Fix ConnectionService
Update `src/services/connection/database-connection-service.ts` to use `org_memberships` and `provider_store_links` instead of legacy queries.

---

## Phase 4: Enable Core Workflows

### 4.1 Cart Management for Stores
- Store admin can add carts to their organization
- Carts use `store_org_id` foreign key
- QR codes generated automatically

### 4.2 Provider-Store Connection Flow
1. Store sends invitation via `invite_user_to_org` RPC
2. Creates pending `provider_store_links` record
3. Provider accepts invitation via `accept_invitation` RPC
4. Link status changes to `active`

### 4.3 Inspection & Issue Tracking
- Inspections created via `submit_inspection_by_qr` RPC
- Issues auto-created from inspection findings
- Work orders generated from issues

---

## Phase 5: Test Edge Functions

### 5.1 Deploy and Test Edge Functions
| Function | Status | Action |
|----------|--------|--------|
| admin-management | Broken | Fix and deploy |
| cart-analytics | Untested | Test with real data |
| auto-schedule-maintenance | Untested | Test scheduling logic |
| predictive-maintenance | Untested | Verify AI predictions |
| maintenance-notifications | Untested | Test email delivery |
| gemini | Working | AI assistant functional |
| send-invitation | Untested | Test invite flow |
| welcome-email | Untested | Test email sending |

---

## Phase 6: Production Readiness

### 6.1 Security Audit
- Review all RLS policies
- Ensure no public data exposure
- Validate edge function authorization

### 6.2 Remove Development Artifacts
- Delete test mode indicators
- Remove debug console logs
- Clean up unused imports

### 6.3 Performance Optimization
- Add database indexes for common queries
- Implement caching where appropriate
- Optimize real-time subscriptions

---

## Implementation Order

```
1. Create corp_admin user (migration)
     ↓
2. Fix admin-management edge function  
     ↓
3. Remove hardcoded managedStores
     ↓
4. Fix ConnectionStatusDisplay
     ↓
5. Test store-provider connection flow
     ↓
6. Add sample carts to test stores
     ↓
7. Test inspection workflow
     ↓
8. Verify admin dashboard works
     ↓
9. Final testing and cleanup
```

---

## Files to Modify

| File | Change Type |
|------|-------------|
| `supabase/functions/admin-management/index.ts` | Major rewrite - fix schema references |
| `src/constants/stores.ts` | Delete |
| `src/pages/Carts.tsx` | Fetch stores from DB |
| `src/components/carts/CartDialog.tsx` | Accept dynamic stores |
| `src/components/carts/CartListSection.tsx` | Accept dynamic stores |
| `src/components/settings/ConnectionStatusDisplay.tsx` | Fix queries |
| `src/services/connection/database-connection-service.ts` | Fix queries |

## Database Changes

1. **Create corp_admin organization and membership** (migration)
2. **Optionally seed sample data** for testing (can be done via Supabase dashboard)

---

## Expected Outcome

After implementing this plan:
- ✅ Admin can access `/admin` and manage the platform
- ✅ Stores can add/manage their carts
- ✅ Providers can connect with stores
- ✅ Inspections and issues tracked in real-time
- ✅ All dashboards show real data
- ✅ No hardcoded sample data anywhere
