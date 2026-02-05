import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminAuthRequest {
  action: 'login' | 'verify' | 'logout'
  username?: string
  password?: string
  session_token?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin auth
    )

    const { action, username, password, session_token }: AdminAuthRequest = await req.json()

    console.log(`Admin auth action: ${action}`)

    // Get client IP and user agent for security logging
    const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : null
    const userAgent = req.headers.get('user-agent') || 'unknown'

    switch (action) {
      case 'login': {
        if (!username || !password) {
          return new Response(
            JSON.stringify({ error: 'Username and password are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data, error } = await supabaseClient.rpc('authenticate_admin', {
          p_username: username,
          p_password: password,
          p_ip_address: clientIP,
          p_user_agent: userAgent
        })

        if (error) {
          console.error('Admin authentication error:', error)
          return new Response(
            JSON.stringify({ error: 'Authentication failed' }),
            { status: 500, headers: corsHeaders }
          )
        }

        if (!data.success) {
          return new Response(
            JSON.stringify({ error: data.message }),
            { status: 401, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            session_token: data.session_token,
            expires_at: data.expires_at,
            admin: data.admin
          }),
          { headers: corsHeaders }
        )
      }

      case 'verify': {
        if (!session_token) {
          return new Response(
            JSON.stringify({ error: 'Session token is required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data, error } = await supabaseClient.rpc('verify_admin_session', {
          p_session_token: session_token
        })

        if (error) {
          console.error('Session verification error:', error)
          return new Response(
            JSON.stringify({ error: 'Session verification failed' }),
            { status: 500, headers: corsHeaders }
          )
        }

        if (!data.success) {
          return new Response(
            JSON.stringify({ error: data.message }),
            { status: 401, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            admin: data.admin,
            session: data.session
          }),
          { headers: corsHeaders }
        )
      }

      case 'logout': {
        if (!session_token) {
          return new Response(
            JSON.stringify({ error: 'Session token is required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data, error } = await supabaseClient.rpc('logout_admin', {
          p_session_token: session_token
        })

        if (error) {
          console.error('Admin logout error:', error)
          return new Response(
            JSON.stringify({ error: 'Logout failed' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: data.message
          }),
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
    console.error('Admin auth function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})