import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting automated maintenance scheduling...')

    // Call the database function to schedule maintenance requests
    const { data: scheduleResult, error: scheduleError } = await supabaseClient
      .rpc('schedule_maintenance_requests')

    if (scheduleError) {
      console.error('Error scheduling maintenance:', scheduleError)
      throw scheduleError
    }

    console.log('Scheduled maintenance requests:', scheduleResult)

    // Find high-risk carts that need immediate attention
    const { data: allCarts, error: cartsError } = await supabaseClient
      .from('carts')
      .select('*, cart_analytics(*)')
      .eq('status', 'active')

    if (cartsError) throw cartsError

    const highRiskCarts = []

    // Analyze each cart for risk
    for (const cart of allCarts || []) {
      const analytics = cart.cart_analytics || []
      const recentAnalytics = analytics.slice(-7) // Last 7 days
      
      const totalIssues = recentAnalytics.reduce((sum: number, a: any) => 
        sum + (Number(a.issues_reported) || 0), 0)
      const avgDowntime = recentAnalytics.reduce((sum: number, a: any) => 
        sum + (Number(a.downtime_minutes) || 0), 0) / Math.max(recentAnalytics.length, 1)
      
      const daysSinceLastMaintenance = cart.last_maintenance ? 
        Math.floor((new Date().getTime() - new Date(cart.last_maintenance).getTime()) / (1000 * 60 * 60 * 24)) : 999

      // Flag high-risk carts
      if (totalIssues > 3 || avgDowntime > 60 || daysSinceLastMaintenance > 90) {
        highRiskCarts.push({
          cart_id: cart.id,
          qr_code: cart.qr_code,
          store_id: cart.store_id,
          issues: totalIssues,
          downtime: avgDowntime,
          days_since_maintenance: daysSinceLastMaintenance
        })
      }
    }

    console.log(`Found ${highRiskCarts.length} high-risk carts`)

    // Create urgent maintenance requests for high-risk carts
    const urgentRequests = []
    for (const riskCart of highRiskCarts) {
      // Check if already has a pending request
      const { data: existing } = await supabaseClient
        .from('maintenance_requests')
        .select('id')
        .eq('cart_id', riskCart.cart_id)
        .in('status', ['pending', 'scheduled'])
        .maybeSingle()

      if (!existing) {
        // Get a connected maintenance provider for this store
        const { data: connection } = await supabaseClient
          .from('store_provider_connections')
          .select('provider_id')
          .eq('store_id', riskCart.store_id)
          .eq('status', 'accepted')
          .limit(1)
          .maybeSingle()

        if (connection) {
          const { error: insertError } = await supabaseClient
            .from('maintenance_requests')
            .insert({
              cart_id: riskCart.cart_id,
              store_id: riskCart.store_id,
              provider_id: connection.provider_id,
              request_type: 'inspection',
              priority: 'high',
              status: 'pending',
              description: `Automated alert: High-risk cart detected. Issues: ${riskCart.issues}, Avg downtime: ${riskCart.downtime.toFixed(0)}min, Days since maintenance: ${riskCart.days_since_maintenance}`,
              scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
            })

          if (!insertError) {
            urgentRequests.push(riskCart.cart_id)
          }
        }
      }
    }

    console.log(`Created ${urgentRequests.length} urgent maintenance requests`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automated maintenance scheduling completed',
        scheduled_from_schedules: scheduleResult?.scheduled_count || 0,
        high_risk_carts: highRiskCarts.length,
        urgent_requests_created: urgentRequests.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Auto-schedule error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
