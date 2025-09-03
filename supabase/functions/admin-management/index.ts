import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminRequest {
  action: 'get_dashboard_stats' | 'manage_user' | 'get_users' | 'get_activities' | 'update_config'
  user_id?: string
  user_action?: 'activate' | 'deactivate' | 'update_role'
  new_role?: string
  reason?: string
  config_key?: string
  config_value?: any
  page?: number
  limit?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for admin operations
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication and admin role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { action, user_id, user_action, new_role, reason, config_key, config_value, page = 1, limit = 20 }: AdminRequest = await req.json()

    console.log(`Admin action: ${action}`, { user_id, user_action, new_role, reason, config_key })

    switch (action) {
      case 'get_dashboard_stats': {
        const { data, error } = await supabaseClient.rpc('get_admin_dashboard_stats')

        if (error) {
          console.error('Error getting dashboard stats:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to get dashboard statistics' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: corsHeaders }
        )
      }

      case 'manage_user': {
        if (!user_id || !user_action) {
          return new Response(
            JSON.stringify({ error: 'user_id and user_action are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data, error } = await supabaseClient.rpc('admin_manage_user', {
          p_user_id: user_id,
          p_action: user_action,
          p_new_role: new_role || null,
          p_reason: reason || null
        })

        if (error) {
          console.error('Error managing user:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to manage user' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: corsHeaders }
        )
      }

      case 'get_users': {
        const offset = (page - 1) * limit

        const { data: users, error: usersError } = await supabaseClient
          .from('profiles')
          .select(`
            id,
            email,
            display_name,
            company_name,
            role,
            is_active,
            created_at,
            updated_at,
            last_sign_in
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (usersError) {
          console.error('Error fetching users:', usersError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch users' }),
            { status: 500, headers: corsHeaders }
          )
        }

        // Get total count
        const { count } = await supabaseClient
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              users,
              pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
              }
            }
          }),
          { headers: corsHeaders }
        )
      }

      case 'get_activities': {
        const offset = (page - 1) * limit

        const { data: activities, error: activitiesError } = await supabaseClient
          .from('admin_activities')
          .select(`
            id,
            action,
            target_type,
            target_id,
            details,
            success,
            error_message,
            created_at,
            profiles!admin_user_id(email, display_name)
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch admin activities' }),
            { status: 500, headers: corsHeaders }
          )
        }

        // Get total count
        const { count } = await supabaseClient
          .from('admin_activities')
          .select('id', { count: 'exact', head: true })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              activities,
              pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
              }
            }
          }),
          { headers: corsHeaders }
        )
      }

      case 'update_config': {
        if (!config_key || config_value === undefined) {
          return new Response(
            JSON.stringify({ error: 'config_key and config_value are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { error } = await supabaseClient
          .from('system_configuration')
          .upsert({
            config_key,
            config_value,
            created_by: user.id
          })

        if (error) {
          console.error('Error updating config:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update configuration' }),
            { status: 500, headers: corsHeaders }
          )
        }

        // Log the configuration change
        await supabaseClient.rpc('log_admin_activity', {
          p_action: 'config_updated',
          p_target_type: 'system',
          p_target_id: config_key,
          p_details: { old_value: 'unknown', new_value: config_value }
        })

        return new Response(
          JSON.stringify({ success: true, message: 'Configuration updated successfully' }),
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
    console.error('Admin management function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})