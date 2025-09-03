import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  type: 'overdue_maintenance' | 'upcoming_maintenance' | 'maintenance_completed'
  recipient_emails?: string[]
  store_id?: string
  provider_id?: string
  maintenance_request_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for system notifications
    )

    const { type, recipient_emails, store_id, provider_id, maintenance_request_id }: NotificationRequest = await req.json()

    console.log(`Maintenance notification: ${type}`, { recipient_emails, store_id, provider_id, maintenance_request_id })

    let emailSubject = ''
    let emailContent = ''
    let recipients: string[] = []

    switch (type) {
      case 'overdue_maintenance': {
        emailSubject = '🚨 Overdue Maintenance Alert'
        
        // Get overdue maintenance requests
        const { data: overdueRequests, error } = await supabaseClient
          .from('maintenance_requests')
          .select(`
            *,
            carts(qr_code, store),
            maintenance_providers(contact_email, company_name)
          `)
          .eq('status', 'pending')
          .lt('scheduled_date', new Date().toISOString().split('T')[0])

        if (error) {
          console.error('Error fetching overdue requests:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch overdue maintenance requests' }),
            { status: 500, headers: corsHeaders }
          )
        }

        if (!overdueRequests?.length) {
          return new Response(
            JSON.stringify({ success: true, message: 'No overdue maintenance requests found' }),
            { headers: corsHeaders }
          )
        }

        emailContent = `
          <h2>Overdue Maintenance Alert</h2>
          <p>The following maintenance requests are overdue:</p>
          <ul>
            ${overdueRequests.map(req => `
              <li>
                <strong>Cart:</strong> ${req.carts?.qr_code} (${req.carts?.store})<br>
                <strong>Type:</strong> ${req.request_type}<br>
                <strong>Scheduled:</strong> ${req.scheduled_date}<br>
                <strong>Provider:</strong> ${req.maintenance_providers?.company_name}
              </li>
            `).join('')}
          </ul>
          <p>Please take immediate action to schedule these maintenance activities.</p>
        `

        // Get unique provider emails for overdue requests
        recipients = [...new Set(overdueRequests
          .map(req => req.maintenance_providers?.contact_email)
          .filter(Boolean)
        )] as string[]

        break
      }

      case 'upcoming_maintenance': {
        emailSubject = '📅 Upcoming Maintenance Reminder'
        
        // Get maintenance requests scheduled for next 3 days
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
        
        const { data: upcomingRequests, error } = await supabaseClient
          .from('maintenance_requests')
          .select(`
            *,
            carts(qr_code, store),
            maintenance_providers(contact_email, company_name)
          `)
          .eq('status', 'pending')
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .lte('scheduled_date', threeDaysFromNow.toISOString().split('T')[0])

        if (error) {
          console.error('Error fetching upcoming requests:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch upcoming maintenance requests' }),
            { status: 500, headers: corsHeaders }
          )
        }

        if (!upcomingRequests?.length) {
          return new Response(
            JSON.stringify({ success: true, message: 'No upcoming maintenance requests found' }),
            { headers: corsHeaders }
          )
        }

        emailContent = `
          <h2>Upcoming Maintenance Reminder</h2>
          <p>The following maintenance requests are scheduled for the next 3 days:</p>
          <ul>
            ${upcomingRequests.map(req => `
              <li>
                <strong>Cart:</strong> ${req.carts?.qr_code} (${req.carts?.store})<br>
                <strong>Type:</strong> ${req.request_type}<br>
                <strong>Scheduled:</strong> ${req.scheduled_date}<br>
                <strong>Provider:</strong> ${req.maintenance_providers?.company_name}
              </li>
            `).join('')}
          </ul>
          <p>Please ensure you're prepared for these maintenance activities.</p>
        `

        recipients = [...new Set(upcomingRequests
          .map(req => req.maintenance_providers?.contact_email)
          .filter(Boolean)
        )] as string[]

        break
      }

      case 'maintenance_completed': {
        if (!maintenance_request_id) {
          return new Response(
            JSON.stringify({ error: 'maintenance_request_id is required for completion notifications' }),
            { status: 400, headers: corsHeaders }
          )
        }

        emailSubject = '✅ Maintenance Completed'
        
        const { data: completedRequest, error } = await supabaseClient
          .from('maintenance_requests')
          .select(`
            *,
            carts(qr_code, store),
            maintenance_providers(contact_email, company_name)
          `)
          .eq('id', maintenance_request_id)
          .single()

        if (error || !completedRequest) {
          console.error('Error fetching completed request:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch maintenance request details' }),
            { status: 500, headers: corsHeaders }
          )
        }

        emailContent = `
          <h2>Maintenance Completed</h2>
          <p>The following maintenance has been completed:</p>
          <ul>
            <li><strong>Cart:</strong> ${completedRequest.carts?.qr_code} (${completedRequest.carts?.store})</li>
            <li><strong>Type:</strong> ${completedRequest.request_type}</li>
            <li><strong>Completed Date:</strong> ${completedRequest.completed_date}</li>
            <li><strong>Provider:</strong> ${completedRequest.maintenance_providers?.company_name}</li>
            <li><strong>Duration:</strong> ${completedRequest.actual_duration || 'Not specified'} minutes</li>
            <li><strong>Cost:</strong> $${completedRequest.cost || 'Not specified'}</li>
          </ul>
          ${completedRequest.notes && Array.isArray(completedRequest.notes) && completedRequest.notes.length > 0 ? `
          <h3>Maintenance Notes:</h3>
          <ul>
            ${completedRequest.notes.map((note: any) => `<li>${note.note || note}</li>`).join('')}
          </ul>
          ` : ''}
        `

        recipients = [completedRequest.maintenance_providers?.contact_email].filter(Boolean) as string[]

        break
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { status: 400, headers: corsHeaders }
        )
    }

    // Use provided recipient emails or discovered ones
    const finalRecipients = recipient_emails && recipient_emails.length > 0 ? recipient_emails : recipients

    if (finalRecipients.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients found for notification' }),
        { headers: corsHeaders }
      )
    }

    // Send notifications using the existing send-invitation function logic
    for (const email of finalRecipients) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Cart Maintenance System <noreply@cartmaintenance.com>',
            to: [email],
            subject: emailSubject,
            html: emailContent,
          }),
        })

        if (!emailResponse.ok) {
          console.error(`Failed to send email to ${email}:`, await emailResponse.text())
        } else {
          console.log(`Notification sent successfully to ${email}`)
        }
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${finalRecipients.length} recipients`,
        recipients: finalRecipients 
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Maintenance notifications function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})