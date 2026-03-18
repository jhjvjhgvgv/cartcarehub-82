

## Plan: Redeploy and Test Email Sending

You've updated the Resend API key. Now we need to redeploy the edge functions so they pick up the new secret, then test that emails send successfully.

### Steps

1. **Redeploy `send-invitation` edge function** — so it uses the new API key
2. **Redeploy `connection-notification` edge function** — same reason
3. **Test `send-invitation`** with a real POST request to confirm the 403 error is resolved and emails are delivered

No code changes needed — this is purely deploy + test.

