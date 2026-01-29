
# Complete Plan: Making Cart Care Hub Fully Operational

## Current State Assessment

### What's Working
| Component | Status |
|-----------|--------|
| Admin System | `corp_admin` user exists, admin-management edge function fixed |
| Onboarding Flow | Multi-step flow for store and maintenance users |
| Cart Form | Store dropdown working (replaced UUID input) |
| Connection Dialog | Uses `invite_user_to_org` RPC |
| Inspection Page | QR-based inspection submission at `/inspection` |
| Managed Stores Hook | Fetches real stores from `get_my_portal_context` RPC |
| Database Schema | Canonical schema with 12 organizations, 10 memberships |

### What Needs Completion
| Issue | Impact | Priority |
|-------|--------|----------|
| Test mode logic still in codebase | Security risk, development artifact | High |
| No IssueList component | Can't view/manage issues | High |
| No work order creation from issues | Incomplete maintenance workflow | High |
| Debug console.logs in production | Performance, clutter | Medium |
| QR scanner doesn't navigate to inspection | Users can't easily submit inspections | Medium |
| Edge functions untested | Unknown reliability | Medium |
| Empty tables (0 carts, 0 connections) | No demo data for testing | Low |

---

## Phase 1: Remove Test Mode Artifacts (Security)

Test mode allows bypassing authentication via localStorage, which is a security vulnerability.

### Files to Modify

**1. `src/components/routing/ProtectedRoute.tsx`**
- Remove all `testMode` and `testRole` localStorage checks
- Remove console.log debug statements
- Keep only proper authentication flow

**2. `src/hooks/use-auth-check.tsx`**
- Remove testMode localStorage check on line 30-38
- Remove debug console.log statements

**3. `src/pages/Settings.tsx`**
- Remove test mode toggle UI (lines 146-159)
- Remove `toggleTestMode` function
- Remove `testMode` state

**4. `src/components/DashboardLayout.tsx`**
- Remove testMode check on lines 34-35
- Remove testMode reference on line 43

**5. `src/components/auth/login/LoadingHandler.tsx`**
- Remove testMode localStorage check on lines 16-21

**6. `src/components/auth/login/SessionChecker.tsx`**
- Remove testMode check on lines 16-17

---

## Phase 2: Create Issue Management System

### Create `src/components/issues/IssueList.tsx`
A component to display open issues with the ability to create work orders.

**Features:**
- Fetch issues from `issues_with_cart` view
- Display severity badges (low/medium/high/critical)
- Show cart information and issue description
- "Create Work Order" button for each issue
- Filter by severity and status

### Update `src/components/maintenance/dashboard/WorkOrderManager.tsx`
Add ability to create work orders from the UI.

**Add:**
- "Create Work Order" dialog with:
  - Store selection dropdown
  - Summary field
  - Notes field
  - Optional link to existing issue
- Insert into `work_orders` table with proper `store_org_id`

---

## Phase 3: Connect QR Scanner to Inspection Flow

### Update `src/components/qr-scanner/useQRScanner.tsx`
Modify the `onScanSuccess` callback to navigate to the inspection page.

**Current behavior:** Appends cache-busting params and calls `onQRCodeDetected`
**New behavior:** 
- Extract the QR token
- Navigate to `/inspection?qr={token}`

### Update `src/components/cart-status/QRScannerDialog.tsx`
Add an option to navigate directly to inspection after scanning.

---

## Phase 4: Clean Up Debug Statements

### Files with console.log to remove:
| File | Lines | Content |
|------|-------|---------|
| `src/pages/Carts.tsx` | 38 | `console.log("Available managed stores:"...)` |
| `src/components/routing/ProtectedRoute.tsx` | 58, 62, 67-69, 89, 107, 119, 129 | Multiple debug logs |
| `src/hooks/use-auth-check.tsx` | 27, 32, 43, 49, 58, 81, 107, 116, 131 | Auth check debug logs |
| `src/components/auth/onboarding/OnboardingContainer.tsx` | 100-115, 235 | Step calculation debug logs |

---

## Phase 5: Test and Verify Edge Functions

### Functions to Test

**1. `admin-management`**
- Verify dashboard stats return correctly
- Test user list action
- Test with corp_admin authentication

**2. `cart-analytics`**
- Test `get_summary` action with a store_id parameter
- Verify metrics calculation

**3. `send-invitation`**
- Test invitation email delivery
- Verify correct URL in email

**4. `welcome-email`**
- Test for both store and maintenance roles
- Verify email content is correct

**5. `predictive-maintenance`**
- Will need carts in the system to test
- Verify AI predictions work

---

## Phase 6: Add Store Carts Page Route

### Issue
The `StoreCarts` component exists but there's no route to it in `AppRoutes.tsx`.

### Solution
Add route for store users to manage their carts directly:

```typescript
// In AppRoutes.tsx
<Route path="/customer/carts" element={
  <ProtectedRoute element={<StoreCarts />} allowedRole="store" />
} />
```

---

## Implementation Summary

| Phase | Files Modified | Priority |
|-------|----------------|----------|
| 1 | 6 files | High (Security) |
| 2 | 2 new/modified files | High (Functionality) |
| 3 | 2 files | Medium |
| 4 | 4 files | Medium (Cleanup) |
| 5 | Edge function testing | Medium |
| 6 | 1 file | Low |

---

## Technical Details

### IssueList Component Structure

```typescript
interface IssueListProps {
  storeOrgId?: string;
}

export function IssueList({ storeOrgId }: IssueListProps) {
  // Fetch from issues_with_cart view
  const { data: issues } = useQuery({
    queryKey: ['issues', storeOrgId],
    queryFn: async () => {
      let query = supabase
        .from('issues_with_cart')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (storeOrgId) {
        query = query.eq('store_org_id', storeOrgId);
      }
      
      return query;
    }
  });

  const createWorkOrder = async (issue: Issue) => {
    await supabase.from('work_orders').insert({
      store_org_id: issue.store_org_id,
      summary: `Issue: ${issue.category} - ${issue.description}`,
      notes: `Created from issue ${issue.id}`,
      status: 'new'
    });
    
    // Update issue status to in_progress
    await supabase
      .from('issues')
      .update({ status: 'in_progress' })
      .eq('id', issue.id);
  };
}
```

### QR Scanner Navigation Update

```typescript
// In useQRScanner.tsx - onScanSuccess
const onScanSuccess = async (decodedText: string) => {
  // Extract QR token from various formats
  let qrToken = decodedText;
  
  if (decodedText.includes('/inspection?qr=')) {
    qrToken = new URL(decodedText).searchParams.get('qr') || decodedText;
  } else if (decodedText.startsWith('CART-') || decodedText.startsWith('QR-')) {
    qrToken = decodedText.split('?')[0];
  }
  
  // Navigate to inspection page
  window.location.href = `/inspection?qr=${encodeURIComponent(qrToken)}`;
};
```

---

## Expected Outcome

After completing all phases:
- No test mode security vulnerabilities
- Full issue-to-work-order workflow functional
- QR scanning leads directly to inspection submission
- Clean production codebase without debug artifacts
- All edge functions verified working
- Store users can manage carts from their dashboard

---

## Testing Checklist

After implementation, verify:

1. **Authentication Flow**
   - [ ] Login redirects to correct dashboard based on role
   - [ ] Onboarding flow completes successfully
   - [ ] No way to bypass auth via localStorage

2. **Cart Management**
   - [ ] Store admins can add carts via dropdown
   - [ ] Maintenance users see carts from connected stores

3. **Inspection Workflow**
   - [ ] QR scan navigates to inspection page
   - [ ] Inspection submission creates records
   - [ ] Issues auto-generated when reported

4. **Work Order Flow**
   - [ ] Can create work orders from issues
   - [ ] Work order status updates correctly
   - [ ] Dashboard shows correct counts

5. **Connection System**
   - [ ] Store can invite provider via email
   - [ ] Provider can see pending invitations
   - [ ] Connection status displays correctly
