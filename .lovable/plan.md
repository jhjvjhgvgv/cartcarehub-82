
# Fix: Maintenance Provider Signup Routing to Correct Portal

## Problem Summary
When users sign up as a maintenance provider, they are incorrectly routed to the store portal instead of the maintenance portal. This affects both email/password signups and Google OAuth signups.

## Root Causes Identified

### 1. Database Function Key Mismatch
The `safe_user_setup` database function checks for `user_role` in the user metadata, but the signup process stores it as `role`:
- **Signup stores**: `{ role: 'maintenance' }`
- **Function checks**: `user_meta->>'user_role'` (wrong key!)

### 2. Google OAuth Missing Role
Google sign-in doesn't pass the selected portal role to Supabase, so Google users always get assigned as store users by default.

### 3. Missing Context Preservation
The `SocialLoginButtons` component doesn't have access to the `selectedRole` from the parent `AuthForm` context.

---

## Solution Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT BROKEN FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│  User selects "Maintenance Portal"                              │
│           ↓                                                     │
│  Signs up (email/password or Google)                            │
│           ↓                                                     │
│  safe_user_setup checks user_meta->>'user_role' (WRONG KEY)     │
│           ↓                                                     │
│  Returns NULL → defaults to 'store' org type                    │
│           ↓                                                     │
│  User lands in Store Portal ❌                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FIXED FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│  User selects "Maintenance Portal"                              │
│           ↓                                                     │
│  Signs up with role passed correctly                            │
│           ↓                                                     │
│  safe_user_setup checks user_meta->>'role' (CORRECT KEY)        │
│           ↓                                                     │
│  Returns 'maintenance' → creates 'provider' org type            │
│           ↓                                                     │
│  User lands in Maintenance Portal ✅                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Changes Required

### 1. Fix Database Function (SQL Migration)

Update the `safe_user_setup` function to check the correct metadata key:

**Before:**
```sql
WHEN user_meta->>'user_role' = 'maintenance' THEN 'provider'::org_type
```

**After:**
```sql
WHEN user_meta->>'role' = 'maintenance' THEN 'provider'::org_type
```

---

### 2. Update SocialLoginButtons Component

Pass the selected role through to Google OAuth so it's stored in user metadata:

**File:** `src/components/auth/components/SocialLoginButtons.tsx`

**Changes:**
- Accept `selectedRole` as a prop from the parent form
- Include role in the OAuth options using `queryParams` or store temporarily in localStorage
- Since OAuth redirects externally, we need to preserve the role selection and apply it after redirect

**Implementation approach:**
```typescript
// Store role before OAuth redirect
localStorage.setItem('pending_signup_role', selectedRole);

// After OAuth callback in onboarding, retrieve and apply:
const pendingRole = localStorage.getItem('pending_signup_role');
if (pendingRole) {
  // Update user metadata with the role
  await supabase.auth.updateUser({
    data: { role: pendingRole }
  });
  localStorage.removeItem('pending_signup_role');
}
```

---

### 3. Update FormActions Component

Pass the `selectedRole` from context to `SocialLoginButtons`:

**File:** `src/components/auth/components/FormActions.tsx`

**Changes:**
- Import and use `useAuthForm` to get `selectedRole`
- Pass `selectedRole` as prop to `SocialLoginButtons`

---

### 4. Handle OAuth Callback in Onboarding

**File:** `src/components/auth/onboarding/OnboardingContainer.tsx`

**Changes:**
- Check for `pending_signup_role` in localStorage when component mounts
- If found, update the user's metadata with the role
- Clear the localStorage item after updating

---

## Technical Details

### Database Migration SQL
```sql
CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  user_email TEXT;
  user_meta JSONB;
  org_name TEXT;
  v_org_type org_type;
  mem_role membership_role;
BEGIN
  -- Get user email and metadata
  SELECT email, raw_user_meta_data INTO user_email, user_meta
  FROM auth.users WHERE id = user_id_param;
  
  -- Ensure profile exists
  INSERT INTO user_profiles (id)
  VALUES (user_id_param)
  ON CONFLICT (id) DO NOTHING;
  
  -- Check if user has any memberships
  IF NOT EXISTS (SELECT 1 FROM org_memberships WHERE user_id = user_id_param) THEN
    -- Determine org type from metadata (check 'role' key, not 'user_role')
    v_org_type := CASE 
      WHEN user_meta->>'role' = 'maintenance' THEN 'provider'::org_type
      ELSE 'store'::org_type
    END;
    
    -- Determine membership role
    mem_role := CASE 
      WHEN v_org_type = 'provider' THEN 'provider_admin'::membership_role
      ELSE 'store_admin'::membership_role
    END;
    
    -- Generate org name
    org_name := COALESCE(
      user_meta->>'company_name',
      SPLIT_PART(user_email, '@', 1) || '''s Organization'
    );
    
    -- Create default org
    INSERT INTO organizations (name, type)
    VALUES (org_name, v_org_type)
    RETURNING id INTO new_org_id;
    
    -- Create membership
    INSERT INTO org_memberships (user_id, org_id, role)
    VALUES (user_id_param, new_org_id, mem_role);
    
    RETURN json_build_object('success', true, 'message', 'User setup with new org completed', 'org_id', new_org_id);
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'User already has membership');
END;
$$;
```

### File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `safe_user_setup` function | SQL Migration | Fix metadata key from `user_role` to `role` |
| `SocialLoginButtons.tsx` | Update | Accept `selectedRole` prop, store in localStorage before OAuth |
| `FormActions.tsx` | Update | Pass `selectedRole` to `SocialLoginButtons` |
| `OnboardingContainer.tsx` | Update | Handle pending role from OAuth callback |

---

## Testing Steps

After implementation:
1. Sign up as a **maintenance provider** using email/password
2. Verify you land on the maintenance dashboard (`/dashboard`)
3. Sign up as a **maintenance provider** using Google OAuth
4. Verify you land on the maintenance dashboard
5. Sign up as a **store** user using both methods
6. Verify you land on the customer dashboard (`/customer/dashboard`)

---

## Risk Assessment

- **Low risk**: Changes are isolated to signup/onboarding flow
- **Backward compatible**: Existing users with correct memberships unaffected
- **Rollback**: Can revert SQL function if issues arise
