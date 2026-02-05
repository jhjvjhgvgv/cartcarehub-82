import { createClient } from "npm:@supabase/supabase-js@2"

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Check if user has corp_admin role using org_memberships
    const { data: membership } = await supabaseClient
      .from('org_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'corp_admin')
      .maybeSingle()

    if (!membership) {
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

        // Query user_profiles joined with org_memberships to get user data
        const { data: users, error: usersError } = await supabaseClient
          .from('user_profiles')
          .select(`
            id,
            full_name,
            phone,
            created_at,
            updated_at
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

        // Enrich with membership data
        const enrichedUsers = await Promise.all((users || []).map(async (user) => {
          const { data: memberships } = await supabaseClient
            .from('org_memberships')
            .select('role, org_id, organizations(name, type)')
            .eq('user_id', user.id)

          // Get email from auth.users
          const { data: authUser } = await supabaseClient.auth.admin.getUserById(user.id)

          return {
            ...user,
            email: authUser?.user?.email || 'N/A',
            memberships: memberships || [],
            role: memberships?.[0]?.role || 'unknown',
            is_active: true // All users in user_profiles are active
          }
        }))

        // Get total count
        const { count } = await supabaseClient
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              users: enrichedUsers,
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

        // Query audit_log instead of admin_activities (which may not exist)
        const { data: activities, error: activitiesError } = await supabaseClient
          .from('audit_log')
          .select(`
            id,
            action,
            entity_type,
            entity_id,
            details,
            created_at,
            actor_user_id
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError)
          // Return empty array if table doesn't exist
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: {
                activities: [],
                pagination: { page, limit, total: 0, pages: 0 }
              }
            }),
            { headers: corsHeaders }
          )
        }

        // Get total count
        const { count } = await supabaseClient
          .from('audit_log')
          .select('id', { count: 'exact', head: true })

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              activities: activities || [],
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

        // Log the configuration change to audit_log
        await supabaseClient
          .from('audit_log')
          .insert({
            action: 'config_updated',
            entity_type: 'system',
            entity_id: config_key,
            actor_user_id: user.id,
            details: { config_key, new_value: config_value }
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
