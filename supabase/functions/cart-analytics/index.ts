import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  action: 'get_summary' | 'bulk_update_status' | 'schedule_maintenance'
  store_id?: string
  date_from?: string
  date_to?: string
  cart_ids?: string[]
  new_status?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { action, store_id, date_from, date_to, cart_ids, new_status }: AnalyticsRequest = await req.json()

    console.log(`Cart analytics action: ${action}`, { store_id, date_from, date_to, cart_ids, new_status })

    switch (action) {
      case 'get_summary': {
        const { data, error } = await supabaseClient.rpc('get_cart_analytics_summary', {
          store_id_param: store_id || null,
          date_from: date_from || null,
          date_to: date_to || null
        })

        if (error) {
          console.error('Error getting analytics summary:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to get analytics summary' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: corsHeaders }
        )
      }

      case 'bulk_update_status': {
        if (!cart_ids || !new_status) {
          return new Response(
            JSON.stringify({ error: 'cart_ids and new_status are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data, error } = await supabaseClient.rpc('bulk_update_cart_status', {
          cart_ids,
          new_status,
          updated_by: user.id
        })

        if (error) {
          console.error('Error bulk updating cart status:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to bulk update cart status' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: corsHeaders }
        )
      }

      case 'schedule_maintenance': {
        const { data, error } = await supabaseClient.rpc('schedule_maintenance_requests')

        if (error) {
          console.error('Error scheduling maintenance:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to schedule maintenance requests' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: corsHeaders }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        )
    }
  } catch (error) {
    console.error('Cart analytics function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})