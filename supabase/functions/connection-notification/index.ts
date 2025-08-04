import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConnectionNotificationRequest {
  type: 'request' | 'accepted' | 'rejected';
  storeId: string;
  providerId: string;
  providerEmail: string;
  providerName: string;
  storeName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, storeId, providerId, providerEmail, providerName, storeName }: ConnectionNotificationRequest = await req.json();

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'request':
        subject = "New Connection Request - Cart Maintenance Platform";
        htmlContent = `
          <h2>New Connection Request</h2>
          <p>Hello ${providerName},</p>
          <p>You have received a new connection request from <strong>${storeName || storeId}</strong>.</p>
          <p>To accept or reject this request, please log in to your maintenance provider dashboard.</p>
          <p>Best regards,<br>Cart Maintenance Team</p>
        `;
        break;
      
      case 'accepted':
        subject = "Connection Accepted - Cart Maintenance Platform";
        htmlContent = `
          <h2>Connection Accepted</h2>
          <p>Great news! ${providerName} has accepted your connection request.</p>
          <p>You can now send maintenance requests to this provider through your dashboard.</p>
          <p>Best regards,<br>Cart Maintenance Team</p>
        `;
        break;
      
      case 'rejected':
        subject = "Connection Request Update - Cart Maintenance Platform";
        htmlContent = `
          <h2>Connection Request Update</h2>
          <p>Your connection request to ${providerName} has been declined.</p>
          <p>You can try connecting with other maintenance providers in your area.</p>
          <p>Best regards,<br>Cart Maintenance Team</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Cart Maintenance <noreply@cartmaintenance.com>",
      to: [providerEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Connection notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in connection-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);