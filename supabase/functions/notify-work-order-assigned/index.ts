import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { work_order_id, assigned_to, status, summary, store_org_id } = await req.json();

    if (!work_order_id || !assigned_to) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch assignee email + name
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(assigned_to);
    if (userErr || !userData?.user?.email) {
      console.error("no user email", userErr);
      return new Response(JSON.stringify({ skipped: "no email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", assigned_to)
      .maybeSingle();

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", store_org_id)
      .maybeSingle();

    const recipient = userData.user.email;
    const displayName = profile?.full_name || "there";
    const storeName = org?.name || "a store";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#111">New work order assigned</h2>
        <p>Hi ${displayName},</p>
        <p>A work order has been assigned to you:</p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0">
          <div><strong>Summary:</strong> ${summary || "Work order"}</div>
          <div><strong>Store:</strong> ${storeName}</div>
          <div><strong>Status:</strong> ${status}</div>
        </div>
        <p><a href="https://cartrepairpros.com/provider/queue" style="background:#0f62fe;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">View your queue</a></p>
        <p style="color:#666;font-size:12px;margin-top:24px">Cart Repair Pros</p>
      </div>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cart Tracker <noreply@cartrepairpros.com>",
        to: [recipient],
        subject: `New work order assigned: ${summary || "Work order"}`,
        html,
      }),
    });

    const result = await resp.json();
    if (!resp.ok) {
      console.error("resend error", result);
      return new Response(JSON.stringify({ error: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
