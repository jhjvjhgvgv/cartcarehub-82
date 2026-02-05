

# Comprehensive System Diagnostic Report

## Executive Summary

After a thorough analysis of the CartCare shopping cart maintenance application, I've identified **28 issues** across the frontend, backend, database, and edge functions. These range from **critical bugs** that break core functionality to **warnings** that could cause future problems.

---

## Critical Issues (Must Fix)

### 1. Maintenance Provider Signup Creates Store Organization (CONFIRMED BUG)

**Severity:** CRITICAL  
**Impact:** Users who sign up as maintenance providers are assigned to store organizations

**Root Cause:**  
The `handle_new_user` database trigger runs immediately when a user is created. For Google OAuth signups:
1. User is created in `auth.users` (no role in metadata yet)
2. Trigger fires and reads `COALESCE(NEW.raw_user_meta_data->>'role', 'store')` → defaults to 'store'
3. Store organization is created with `store_admin` membership
4. LATER, the frontend applies `pending_signup_role` → too late, org already exists

**Evidence:**
```text
User: craftsforgain@gmail.com
meta_role: maintenance (applied after signup)
org_type: store (created during signup)
membership_role: store_admin (wrong!)
```

**Fix Required:**
- Modify the `handle_new_user` trigger to NOT create organizations immediately
- Instead, defer org creation to the onboarding flow where role is known
- OR: Add logic to detect and fix mismatched roles after OAuth callback

---

### 2. Missing GEMINI_API_KEY Secret

**Severity:** HIGH  
**Impact:** AI Cart Assistant feature is non-functional

**Evidence:**
```text
Secrets found: LOVABLE_API_KEY, RESEND_API_KEY
Missing: GEMINI_API_KEY
```

The `gemini` edge function checks for this key and returns a 503 error if missing.

---

### 3. Email Sending Fails (Resend Domain Not Verified)

**Severity:** HIGH  
**Impact:** Welcome emails and invitations fail to send

**Evidence from logs:**
```text
error: "You can only send testing emails to your own email address 
(electriccovecoffee@gmail.com). To send emails to other recipients, 
please verify a domain at resend.com/domains"
```

**Fix Required:**
- Verify a domain in Resend dashboard
- Update the `from` address in email functions to use verified domain

---

### 4. RLS Disabled on `store_daily_rollups` Table

**Severity:** HIGH  
**Impact:** Security vulnerability - table data is publicly accessible

**Evidence:**
```text
Table: store_daily_rollups
rowsecurity: false
```

---

### 5. ConnectionService Uses localStorage Instead of Database

**Severity:** HIGH  
**Impact:** Store-provider connections are not persistent

**Code Location:** `src/services/connection/connection-service.ts`

The service stores all connection data in `localStorage`, meaning:
- Connections are lost when browser data is cleared
- Connections don't sync across devices
- The `provider_store_links` table exists but is unused (0 records)

---

## Database Issues (22 Security Definer Views)

### 6-27. Security Definer Views

**Severity:** MEDIUM-HIGH  
**Impact:** Views bypass RLS policies of querying user

All 22 public views are defined with `SECURITY DEFINER`:
- cart_last_inspection
- cart_last_score  
- cart_issue_counts
- carts_enriched
- cart_predictions
- carts_with_predictions
- store_dashboard_snapshot
- cart_downtime_windows
- store_kpis_30d
- corp_kpis_30d
- carts_with_store
- issues_with_cart
- work_orders_with_store
- store_uptime_kpis_30d
- store_current_availability
- store_downtime_cost_30d
- cart_downtime_episodes
- cart_mtbf_segments
- store_mtbf_30d
- store_mttr_30d
- store_inspection_coverage_30d
- store_inspection_coverage_7d
- store_preventive_kpis
- corp_preventive_kpis
- cart_alerts

---

### 28. Function Search Path Warnings (6 Functions)

**Severity:** MEDIUM  
**Impact:** Potential SQL injection vulnerability

Functions without proper `search_path`:
- Various functions need `SET search_path = public` to be secure

---

## Edge Function Issues

### 29. Predictive Maintenance References Non-Existent Tables

**Severity:** HIGH  
**Impact:** Function will fail when called

**File:** `supabase/functions/predictive-maintenance/index.ts`

References these tables that don't exist:
- `cart_analytics`
- `maintenance_schedules`

Also references non-existent columns:
- `carts.last_maintenance`
- `carts.issues`

---

## Data Issues

### 30. Empty Core Tables

**Current State:**
```text
carts: 0 records
inspections: 0 records
issues: 0 records
work_orders: 0 records
provider_store_links: 0 records
```

While not a bug, this affects testing and demo functionality.

---

### 31. Database UUID Error in Logs

**Evidence:**
```text
error_message: "invalid input syntax for type uuid: \"\""
```

Some code is passing empty strings where UUIDs are expected.

---

## Authentication Flow Issues

### 32. Onboarding Step Calculation Hardcoded

**File:** `src/hooks/use-auth-check.tsx`

The `useOnboardingProgress` hook hardcodes `'store'` for step calculation:
```typescript
const step = calculateStep(status, 'store'); // Line 204
```

This could cause incorrect step progression for maintenance users.

---

### 33. Profile Role Resolution Complexity

The system has multiple sources of truth for user role:
1. `user.user_metadata.role`
2. `org_memberships.role`
3. `user_onboarding` status

These can become out of sync, causing routing issues.

---

## Missing Features (From Original Plan)

### 34. Admin System Incomplete

- Master admin login exists but requires separate auth system
- No way to access admin via regular user portal context
- `corp_admin` role routing not fully tested

### 35. Work Order Management Needs Data

The WorkOrderManager component exists but:
- No work orders in database
- No way to create work orders from store dashboard

---

## Security Recommendations

### 36. Leaked Password Protection Disabled

From linter: Password protection for leaked passwords is disabled.

### 37. Postgres Version Has Security Patches Available

The database version has pending security updates.

---

## Recommended Fix Priority

```text
IMMEDIATE (Blocks Core Functionality):
┌──────────────────────────────────────────────────────────────────┐
│ 1. Fix handle_new_user trigger to defer org creation            │
│ 2. Enable RLS on store_daily_rollups                            │
│ 3. Configure GEMINI_API_KEY secret                              │
│ 4. Verify domain in Resend for email sending                    │
│ 5. Migrate ConnectionService to use provider_store_links table  │
└──────────────────────────────────────────────────────────────────┘

HIGH PRIORITY (Security):
┌──────────────────────────────────────────────────────────────────┐
│ 6. Convert SECURITY DEFINER views to SECURITY INVOKER           │
│ 7. Add search_path to functions without it                      │
│ 8. Enable leaked password protection                            │
│ 9. Apply Postgres security patches                              │
└──────────────────────────────────────────────────────────────────┘

MEDIUM PRIORITY (Features):
┌──────────────────────────────────────────────────────────────────┐
│ 10. Create missing tables (cart_analytics, maintenance_schedules)│
│ 11. Fix predictive-maintenance edge function                     │
│ 12. Add seed data for testing/demo                              │
│ 13. Complete admin dashboard integration                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Fix for Issue #1: Maintenance Provider Signup

The `handle_new_user` trigger needs modification:

**Option A: Defer org creation completely**
```sql
-- Remove org creation from trigger
-- Only create user_profiles and user_onboarding
-- Org creation happens in onboarding flow
```

**Option B: Check for pending_signup_role metadata**
```sql
-- In trigger, check if this is an OAuth user
-- If so, wait for role to be applied via separate RPC
```

**Option C: Add a "fix mismatched role" RPC function**
```sql
-- After OAuth callback applies role
-- If org_type doesn't match role, recreate org/membership
```

### Fix for Issue #5: ConnectionService

Replace localStorage implementation with Supabase queries:
```typescript
// Instead of localStorage.getItem('storeConnections')
const { data } = await supabase
  .from('provider_store_links')
  .select('*')
  .eq('provider_org_id', providerId);
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical Bugs | 5 |
| Security Issues | 24 |
| Missing Features | 3 |
| Data Issues | 2 |
| **Total** | **34** |

