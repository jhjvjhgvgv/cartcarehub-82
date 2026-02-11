import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConnectionNotificationRequest {
  type: 'request' | 'accepted' | 'rejected';
  storeOrgId: string;
  providerOrgId: string;
  recipientEmail?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body: ConnectionNotificationRequest = await req.json();
    const { type, storeOrgId, providerOrgId, recipientEmail } = body;

    console.log("Connection notification:", { type, storeOrgId, providerOrgId });

    // Look up org names using service role
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [storeResult, providerResult] = await Promise.all([
      supabase.from('organizations').select('name').eq('id', storeOrgId).maybeSingle(),
      supabase.from('organizations').select('name').eq('id', providerOrgId).maybeSingle(),
    ]);

    const storeName = storeResult.data?.name || 'Unknown Store';
    const providerName = providerResult.data?.name || 'Unknown Provider';

    let subject = '';
    let messageHtml = '';

    switch (type) {
      case 'request':
        subject = `New Connection Request from ${storeName}`;
        messageHtml = `<p>${storeName} has requested to connect with ${providerName} for shopping cart maintenance services.</p>
          <p>Please log in to your dashboard to review and accept this connection.</p>`;
        break;
      case 'accepted':
        subject = `Connection Accepted - ${storeName} & ${providerName}`;
        messageHtml = `<p>The connection between ${storeName} and ${providerName} has been accepted.</p>
          <p>You can now manage shopping carts and maintenance work orders together.</p>`;
        break;
      case 'rejected':
        subject = `Connection Request Declined`;
        messageHtml = `<p>The connection request between ${storeName} and ${providerName} has been declined.</p>`;
        break;
    }

    // Send email if Resend is configured and we have a recipient
    if (resendApiKey && recipientEmail) {
      const resend = new Resend(resendApiKey);
      
      try {
        const { data, error } = await resend.emails.send({
          from: "Cart Tracker <noreply@cartrepairpros.com>",
          to: [recipientEmail],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
              <h2 style="color: #333;">${subject}</h2>
              ${messageHtml}
              <p>Best regards,<br>The Cart Tracker Team</p>
            </div>
          `,
        });

        if (error) {
          console.warn("Email sending failed:", error.message);
        } else {
          console.log("Notification email sent:", data);
        }
      } catch (emailErr) {
        console.warn("Email sending error (non-fatal):", emailErr);
      }
    } else {
      console.log("Skipping email: no RESEND_API_KEY or recipientEmail provided");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type} notification processed for ${storeName} / ${providerName}`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in connection-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

Deno.serve(handler);
