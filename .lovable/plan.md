
# Next Steps to Make Cart Care Hub Fully Functional

## Current State Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Admin System** | ✅ Working | `corp_admin` user created, admin-management function fixed |
| **Connection Display** | ✅ Working | Uses `provider_store_links` table directly |
| **Sample Data** | ✅ Removed | `managedStores` constant deleted, using live database |
| **Carts** | ❌ Empty | 0 carts in database across 6 stores |
| **Provider-Store Links** | ❌ Empty | 0 connections - stores and providers can't collaborate |
| **Test Mode** | ⚠️ Still Present | Development artifact that should be removed |
| **CartForm** | ⚠️ Needs Fix | Shows raw UUID input instead of store dropdown |

---

## Phase 1: Fix Cart Creation Form (Critical)

### Problem
The `CartForm` component (used when adding new carts) displays a raw text input for `store_org_id` instead of a dropdown selector:

```
Store Organization ID: [text input with UUID]
```

Users cannot easily add carts because they don't know their organization UUID.

### Solution
Update `CartForm` to accept a `stores` prop and render a dropdown selector, matching the pattern already used in `CartDialog`.

**Files to modify:**
- `src/components/cart-form.tsx` - Add `stores` prop, change `store_org_id` field to Select dropdown
- `src/pages/Carts.tsx` - Pass `managedStores` to the CartForm via CartDialog

---

## Phase 2: Fix Provider-Store Connection Flow

### Problem
The `ConnectionDialog` has two issues:
1. Uses `requestConnectionByEmail()` which returns a stub error: "Email-based connections are deprecated"
2. Uses `generateStoreId()` which doesn't match database organization IDs

### Solution
Update connection flow to use the `invite_user_to_org` RPC which creates proper invitation records and pending `provider_store_links`.

**Files to modify:**
- `src/components/settings/ConnectionDialog.tsx` - Use RPC-based invitation system
- `src/services/connection/database-connection-service.ts` - Implement `requestConnectionByEmail` properly using `invite_user_to_org` RPC

**New workflow:**
1. Store admin enters provider email
2. System calls `invite_user_to_org` RPC
3. Creates invitation record and pending `provider_store_links` entry
4. Provider receives invitation and accepts
5. Link status changes to `active`

---

## Phase 3: Enable Inspection & Issue Workflow

### Problem
No mechanism for users to submit inspections and create issues through the UI.

### Solution
Create a QR-based inspection flow that uses the `submit_inspection_by_qr` RPC.

**Components to create/update:**
- Create `src/pages/Inspection.tsx` - Inspection submission form
- Update QR scanner to navigate to inspection page
- Add inspection results to cart detail view

**Inspection flow:**
1. User scans cart QR code
2. Opens inspection form with checklist
3. Submits inspection via `submit_inspection_by_qr` RPC
4. System creates inspection record, status event, and optional issue

---

## Phase 4: Update Work Order Manager

### Problem
The `WorkOrderManager` component queries `work_orders_with_store` view but work orders table is empty and there's no way to create work orders from issues.

### Solution
Add "Create Work Order" button on issues list that generates work orders from detected issues.

**Files to modify:**
- `src/components/maintenance/dashboard/WorkOrderManager.tsx` - Add work order creation dialog
- Create `src/components/issues/IssueList.tsx` - Display issues with "Create Work Order" action

---

## Phase 5: Remove Development Artifacts

### Files to delete/modify:

| File | Action |
|------|--------|
| `src/components/ui/test-mode-indicator.tsx` | Delete |
| `src/components/auth/TestMode.tsx` | Delete |
| `src/components/App/MainApp.tsx` | Remove TestModeIndicator import and usage |
| `src/components/DashboardLayout.tsx` | Remove TestModeIndicator import and usage |

### Console logs to remove:
- Remove debug `console.log` statements from:
  - `CartDialog.tsx` (lines 33-34, 37-38, 53-54)
  - `ConnectionDialog.tsx` (line 83)

---

## Phase 6: Test Edge Functions

### Functions requiring testing:

| Function | Current State | Test Action |
|----------|--------------|-------------|
| `admin-management` | Fixed | Call with corp_admin auth token |
| `cart-analytics` | Untested | Test `get_summary` action |
| `send-invitation` | Working | Verify email delivery with domain |
| `predictive-maintenance` | Untested | Test with sample cart data |
| `auto-schedule-maintenance` | Untested | Test scheduling logic |
| `maintenance-notifications` | Untested | Test email notifications |
| `welcome-email` | Untested | Test new user email |

---

## Phase 7: Add Sample Data for Testing

Once cart creation is fixed, add sample data:

1. **Add 5-10 carts** to test stores via the UI
2. **Create provider-store connection** between a provider and store
3. **Submit test inspections** to generate inspection history
4. **Create sample issues** to test work order flow

---

## Implementation Order

```text
1. Fix CartForm store dropdown      ← Enables cart creation
        ↓
2. Fix ConnectionDialog RPC         ← Enables store-provider connections  
        ↓
3. Add inspection submission page   ← Enables inspection workflow
        ↓
4. Add work order creation          ← Enables maintenance workflow
        ↓
5. Remove test mode artifacts       ← Production cleanup
        ↓
6. Test edge functions              ← Verify backend works
        ↓
7. Add sample data                  ← Test complete workflows
```

---

## Technical Details

### CartForm Store Dropdown Implementation

```typescript
// Add to CartFormProps
interface CartFormProps {
  stores?: Array<{ id: string; name: string }>;
  // ... existing props
}

// Change store_org_id field from Input to Select
<FormField
  name="store_org_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Store</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          {stores?.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

### Connection Flow Using RPC

```typescript
// Call invite_user_to_org RPC
const { data, error } = await supabase.rpc('invite_user_to_org', {
  p_org_id: userOrgId,           // Store's org ID
  p_email: providerEmail,        // Provider's email
  p_role: 'provider_tech',       // Role to grant
  p_provider_org_id: null        // Set when creating provider link
});
```

---

## Expected Outcome

After completing all phases:
- ✅ Store admins can add carts via intuitive dropdown
- ✅ Stores and providers can connect via email invitations
- ✅ Users can submit inspections by scanning cart QR codes
- ✅ Issues automatically create work orders
- ✅ All dashboards display real-time data
- ✅ No development artifacts in production code
- ✅ All edge functions tested and functional
