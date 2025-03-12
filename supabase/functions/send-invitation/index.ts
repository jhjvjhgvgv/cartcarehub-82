
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { email, type, invitedBy }: InvitationRequest = await req.json();
    
    console.log(`Sending invitation to ${email} as ${type} from ${invitedBy.name}`);
    
    const inviterType = invitedBy.type === "maintenance" ? "Maintenance Provider" : "Store";
    const inviteeType = type === "maintenance" ? "Maintenance Provider" : "Store";
    
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
            <a href="http://localhost:5173/invite?id=${invitedBy.id}&type=${type}" style="background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
          </div>
          <p>If you don't recognize this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br>The Cart Tracker Team</p>
        </div>
      `,
    });
    
    if (error) {
      console.error("Error sending email:", error);
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
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
