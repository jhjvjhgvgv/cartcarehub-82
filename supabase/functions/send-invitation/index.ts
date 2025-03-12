
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  type: "store" | "maintenance";
  invitedBy: {
    id: string;
    name: string;
    type: "store" | "maintenance";
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing invitation request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      const error = "RESEND_API_KEY is not configured";
      console.error(error);
      return new Response(
        JSON.stringify({ success: false, error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate request
    let requestData: InvitationRequest;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email, type, invitedBy } = requestData;
    
    // Validate required fields
    if (!email || !type || !invitedBy?.id || !invitedBy?.name || !invitedBy?.type) {
      const error = "Missing required fields";
      console.error(error, { email, type, invitedBy });
      return new Response(
        JSON.stringify({ success: false, error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log(`Sending invitation to ${email} as ${type} from ${invitedBy.name}`);
    
    const resend = new Resend(resendApiKey);
    const inviterType = invitedBy.type === "maintenance" ? "Maintenance Provider" : "Store";
    const inviteeType = type === "maintenance" ? "Maintenance Provider" : "Store";
    
    // Get actual domain instead of localhost for production environments
    const domain = req.headers.get("origin") || "https://carttracker.app";
    const inviteUrl = `${domain}/invite?id=${invitedBy.id}&type=${type}`;
    
    console.log(`Invitation URL: ${inviteUrl}`);
    
    const { data, error } = await resend.emails.send({
      from: "Cart Tracker <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation to join as ${inviteeType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 20px;">You've Been Invited!</h2>
          <p>Hello,</p>
          <p>${invitedBy.name} (${inviterType}) has invited you to join their Cart Tracker network as a ${inviteeType}.</p>
          <p>To accept this invitation, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
          </div>
          <p>If you don't recognize this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br>The Cart Tracker Team</p>
        </div>
      `,
    });
    
    if (error) {
      console.error("Error sending email:", error);
      
      // Check for common Resend errors and provide better error messages
      if (error.message && error.message.includes("You can only send testing emails to your own email address")) {
        console.warn("Development mode restriction detected");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Development mode: To send emails to other addresses, please verify a domain in Resend.",
            details: "In development, you can only send to your own email address. Visit https://resend.com/domains to verify a domain."
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      if (error.message && error.message.includes("rate limit")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Rate limit exceeded. Please try again later."
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("Email sent successfully:", data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Unhandled error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
