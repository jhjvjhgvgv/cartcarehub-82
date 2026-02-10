

# Plan: Fix Account Connections and Active Emailing

## What's Broken Right Now

There are three core problems preventing accounts from connecting and communicating:

1. **Invitation emails can't reach external recipients** -- The Resend integration uses `onboarding@resend.dev` (a sandbox address), which only allows sending to the Resend account owner's email. All invitations to other people silently fail.

2. **The ConnectionDialog uses the wrong parameters** -- When a store invites a maintenance provider, it passes the store's own org ID as `p_provider_org_id`, which is incorrect. The invite flow creates broken `provider_store_links` records.

3. **The Invite page uses raw user IDs instead of org IDs** -- When someone clicks an invitation link, the code passes the user's auth ID to `requestConnection()` instead of their organization ID, so the `provider_store_links` RLS policies reject the insert.

4. **The connection-notification edge function doesn't actually send emails** -- It just logs to the console and returns success without using Resend.

5. **The InvitationForm uses a hardcoded "demo-user"** -- It never passes the real authenticated user's info, so invitations appear to come from nobody.

---

## What We'll Fix

### 1. Fix the ConnectionDialog invitation logic

The dialog currently does:
```
p_provider_org_id: isMaintenance ? userOrgId : null
```

This is wrong. When a **store** invites a **provider**, the provider's org ID should be passed. When a **maintenance** provider invites a **store**, the store's org ID is the target. We'll update ConnectionDialog to:
- Accept an email AND look up the target organization
- Pass the correct `p_provider_org_id` (the provider's org, not the store's)
- Also trigger the email sending via the `send-invitation` edge function after the RPC succeeds

### 2. Fix the send-invitation edge function to use the actual app URL

Change the invitation URL from the hardcoded `https://cartrepairpros.com` to use the `SITE_URL` secret or fall back to the Lovable preview URL. This ensures invitation links actually work.

### 3. Fix the connection-notification edge function to send real emails

Update it to use Resend (the `RESEND_API_KEY` is already configured) to send actual notification emails when connections are requested, accepted, or rejected.

### 4. Fix the Invite page to use org IDs

When processing an invitation link, the page currently passes the auth user ID to `requestConnection()`. We'll update it to:
- Look up the current user's org membership
- Pass the correct org IDs to `requestConnection()`

### 5. Fix the InvitationForm to use real user data

Replace the hardcoded `demo-user` with the actual authenticated user's profile information from the `useUserProfile` hook.

### 6. Add a two-way connection flow

Currently connections are created as "active" immediately. We'll implement a proper pending/accept flow:
- Store invites provider (or vice versa) -- creates a `pending` link
- Recipient sees pending request in their settings
- Recipient accepts or rejects
- Both parties get email notifications at each step

---

## Technical Details

### Files to Modify

**Frontend:**
- `src/components/settings/ConnectionDialog.tsx` -- Fix org ID logic, add email sending after RPC
- `src/components/settings/InvitationForm.tsx` -- Replace hardcoded demo user with real auth data
- `src/pages/Invite.tsx` -- Look up user's org ID before calling `requestConnection()`
- `src/services/connection/database-connection-service.ts` -- Update `sendConnectionNotification()` to call the edge function with Resend

**Edge Functions:**
- `supabase/functions/send-invitation/index.ts` -- Use `SITE_URL` secret or preview URL instead of hardcoded domain
- `supabase/functions/connection-notification/index.ts` -- Implement actual email sending via Resend

### Database

No schema changes needed. The `provider_store_links`, `invitations`, and `organizations` tables already have the correct structure and RLS policies.

### Email Flow After Fix

1. User clicks "Connect to Provider" or "Invite Store" in Settings
2. Enters target email address
3. System calls `invite_user_to_org` RPC (creates invitation record + pending provider_store_link)
4. System calls `send-invitation` edge function (sends email via Resend)
5. Recipient clicks link in email, lands on `/invite` page
6. Invite page looks up the user's org, creates/accepts the connection
7. `connection-notification` edge function sends confirmation emails to both parties

### Important Note for Email

The `RESEND_API_KEY` is configured, but emails can only be sent to external addresses after you verify a domain at https://resend.com/domains. Until then, emails will only work when sent to the Resend account owner's address. This is a Resend requirement, not a code issue.
