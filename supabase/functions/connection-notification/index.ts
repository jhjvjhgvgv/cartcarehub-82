import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Log the notification request (in production, integrate with email service)
    console.log("Connection notification request:", {
      type,
      storeId,
      providerId,
      providerEmail,
      providerName,
      storeName,
    });

    let message = "";
    switch (type) {
      case 'request':
        message = `New connection request from ${storeName || storeId} to ${providerName}`;
        break;
      case 'accepted':
        message = `Connection accepted by ${providerName}`;
        break;
      case 'rejected':
        message = `Connection rejected by ${providerName}`;
        break;
    }

    // Return success - email integration can be added later with proper RESEND_API_KEY
    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        note: "Email sending requires RESEND_API_KEY to be configured"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
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
