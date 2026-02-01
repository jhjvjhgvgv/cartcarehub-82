
# Implementation Plan: Making Cart Care Hub Fully Operational

## Overview
This plan addresses the remaining security vulnerabilities and functionality gaps to make the application production-ready.

---

## Phase 1: Remove Test Mode Security Artifacts (Critical Priority)

The current codebase allows bypassing authentication via `localStorage.setItem("testMode", "true")`, which is a significant security vulnerability.

### Files to Modify:

**1. `src/components/routing/ProtectedRoute.tsx`**
- Remove lines 14-15: `const testMode = localStorage.getItem("testMode")` and `const testRole`
- Remove line 24 testMode check in onboarding: `|| testMode === "true"`
- Remove line 56 testMode dependency: `, testMode`
- Remove line 58 debug log
- Remove lines 60-72: Entire test mode bypass block
- Remove all other console.log statements (lines 76, 89, 107, 113, 120, 129)

**2. `src/hooks/use-auth-check.tsx`**
- Remove line 3: `import { ConnectionService }` (unused)
- Remove lines 29-38: Test mode localStorage check and early return
- Remove all console.log statements (lines 27, 32, 43, 49, 58, 81, 86, 107, 116, 132)

**3. `src/pages/Settings.tsx`**
- Remove lines 27-29: `testMode` state initialization
- Remove lines 39-55: `toggleTestMode` function
- Remove lines 147-159: Test mode toggle UI in Developer tab
- Remove line 174: `DevModeInstructions` reference with testMode prop

**4. `src/components/auth/login/LoadingHandler.tsx`**
- Remove lines 15-22: testMode localStorage check that redirects based on testRole

**5. `src/components/auth/login/SessionChecker.tsx`**
- Remove lines 16-17: testMode localStorage check early return

---

## Phase 2: Create Issue Management System

### Create New File: `src/components/issues/IssueList.tsx`

A component to display open issues and enable work order creation:

```typescript
// Features:
// - Fetch from issues_with_cart view
// - Display severity badges (low/medium/high/critical)
// - Show cart information (asset_tag, qr_token)
// - "Create Work Order" button that inserts into work_orders table
// - Update issue status to 'in_progress' when work order created
// - Filter by severity and status
```

### Update: `src/components/maintenance/dashboard/WorkOrderManager.tsx`
- Add "Create New Work Order" dialog with:
  - Store selection dropdown (from managed stores)
  - Summary text field
  - Notes textarea
  - Submit to `work_orders` table with `store_org_id`

---

## Phase 3: Connect QR Scanner to Inspection Flow

### Update: `src/components/qr-scanner/useQRScanner.tsx`

Modify `onScanSuccess` to navigate directly to the inspection page:

```typescript
const onScanSuccess = async (decodedText: string) => {
  // Extract QR token from scanned text
  let qrToken = decodedText;
  
  if (decodedText.startsWith("CART-") || decodedText.startsWith("QR-")) {
    qrToken = decodedText.split('?')[0]; // Remove cache-busting params
  }
  
  // Navigate to inspection page with QR token
  window.location.href = `/inspection?qr=${encodeURIComponent(qrToken)}`;
};
```

---

## Phase 4: Clean Up Debug Statements

### Files with console.log to remove:

| File | Action |
|------|--------|
| `src/pages/Carts.tsx` | Remove line 38 |
| `src/components/auth/onboarding/OnboardingContainer.tsx` | Remove lines 100-115, 235 |

---

## Phase 5: Add Missing Route

### Update: `src/components/routing/AppRoutes.tsx`

Add route for store users to access carts page:

```typescript
import StoreCarts from "@/pages/store/StoreCarts";

// Add after line 63:
<Route path="/customer/carts" element={
  <ProtectedRoute element={<StoreCarts />} allowedRole="store" />
} />
```

---

## Technical Summary

### Files to Create:
1. `src/components/issues/IssueList.tsx` - Issue management with work order creation

### Files to Modify:
1. `src/components/routing/ProtectedRoute.tsx` - Remove test mode bypass
2. `src/hooks/use-auth-check.tsx` - Remove test mode checks
3. `src/pages/Settings.tsx` - Remove test mode UI
4. `src/components/auth/login/LoadingHandler.tsx` - Remove test mode redirect
5. `src/components/auth/login/SessionChecker.tsx` - Remove test mode check
6. `src/components/qr-scanner/useQRScanner.tsx` - Navigate to inspection
7. `src/components/maintenance/dashboard/WorkOrderManager.tsx` - Add create dialog
8. `src/components/routing/AppRoutes.tsx` - Add customer carts route
9. `src/pages/Carts.tsx` - Remove debug log
10. `src/components/auth/onboarding/OnboardingContainer.tsx` - Remove debug logs

---

## Expected Outcomes

After implementation:
- No test mode security vulnerabilities in production
- Full issue-to-work-order workflow functional
- QR scanning leads directly to inspection submission
- Clean production codebase without debug artifacts
- Store users can access their carts page
- All authentication flows use proper server-side validation
