import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  role: 'store' | 'maintenance';
  company_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, role, company_name }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email, "Role:", role);

    // Role-specific email content
    const storeEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to CartCare, ${name}! 🛒</h1>
        <p>Your account for <strong>${company_name || 'your store'}</strong> is now active and ready to use.</p>
        
        <h2 style="color: #555;">Getting Started</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Manage Your Carts:</strong> Track all your shopping carts in one place</li>
          <li><strong>Schedule Maintenance:</strong> Connect with maintenance providers for regular upkeep</li>
          <li><strong>Monitor Status:</strong> Get real-time updates on cart condition and availability</li>
          <li><strong>Generate Reports:</strong> Access analytics and cost tracking</li>
        </ul>

        <h2 style="color: #555;">Quick Actions</h2>
        <p>Here's what you can do right now:</p>
        <ul style="line-height: 1.8;">
          <li>Add your first shopping cart to the system</li>
          <li>Connect with a maintenance provider</li>
          <li>Generate QR codes for easy cart identification</li>
          <li>Set up maintenance schedules</li>
        </ul>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Use QR codes to quickly scan and update cart status from your mobile device.</p>
        </div>

        <p style="margin-top: 30px;">
          <a href="${Deno.env.get("SITE_URL") || "https://your-app-url.com"}/customer/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>

        <p style="color: #666; margin-top: 30px;">
          Need help? Contact our support team or check out our documentation.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          CartCare - Shopping Cart Maintenance Management
        </p>
      </div>
    `;

    const maintenanceEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to CartCare, ${name}! 🔧</h1>
        <p>Your maintenance provider account for <strong>${company_name || 'your company'}</strong> is now active.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏳ Verification Pending:</strong> An admin will review your business verification submission. You'll be notified once approved.</p>
        </div>

        <h2 style="color: #555;">What's Next?</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Wait for Verification:</strong> We'll review your business credentials</li>
          <li><strong>Connect with Stores:</strong> Once verified, you can accept connection requests</li>
          <li><strong>Manage Work Orders:</strong> Track maintenance requests and schedules</li>
          <li><strong>Build Your Reputation:</strong> Complete jobs and earn ratings</li>
        </ul>

        <h2 style="color: #555;">While You Wait</h2>
        <p>You can still:</p>
        <ul style="line-height: 1.8;">
          <li>Complete your business profile</li>
          <li>Review the platform features</li>
          <li>Explore the dashboard</li>
          <li>Set up your service areas and pricing</li>
        </ul>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Having your business license and insurance ready speeds up the verification process.</p>
        </div>

        <p style="margin-top: 30px;">
          <a href="${Deno.env.get("SITE_URL") || "https://your-app-url.com"}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>

        <p style="color: #666; margin-top: 30px;">
          Questions about verification? Contact our admin team.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          CartCare - Shopping Cart Maintenance Management
        </p>
      </div>
    `;

    const emailContent = role === 'store' ? storeEmailContent : maintenanceEmailContent;
    const subject = role === 'store' 
      ? `Welcome to CartCare - Let's Get Started! 🛒`
      : `Welcome to CartCare - Verification Pending 🔧`;

    const emailResponse = await resend.emails.send({
      from: "CartCare <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: emailContent,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
