
# Plan: Remove Apple Sign-In, Keep Google Only

## Overview
Simplify the social login component to only offer Google authentication.

---

## Changes Required

### File: `src/components/auth/components/SocialLoginButtons.tsx`

**Remove:**
- `isAppleLoading` state (line 9)
- `handleAppleLogin` function (lines 40-66)
- Apple button JSX (lines 114-131)
- References to `isAppleLoading` in the Google button's disabled prop

**Update:**
- Change layout from `grid-cols-2` to single full-width button
- Simplify disabled prop to only check `isGoogleLoading`

---

## Result

The login screen will show a single "Continue with Google" button that spans the full width, providing a cleaner authentication experience.
