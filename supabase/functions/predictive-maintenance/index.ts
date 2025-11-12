import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { cart_id } = await req.json()

    // Fetch cart analytics data
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('cart_analytics')
      .select('*')
      .eq('cart_id', cart_id)
      .order('metric_date', { ascending: false })
      .limit(30)

    if (analyticsError) throw analyticsError

    // Fetch cart details
    const { data: cart, error: cartError } = await supabaseClient
      .from('carts')
      .select('*, maintenance_schedules(*)')
      .eq('id', cart_id)
      .single()

    if (cartError) throw cartError

    // Prepare data summary for AI analysis
    const analyticsData = analytics || []
    const totalUsageHours = analyticsData.reduce((sum, a) => sum + (Number(a.usage_hours) || 0), 0)
    const totalIssues = analyticsData.reduce((sum, a) => sum + (Number(a.issues_reported) || 0), 0)
    const avgDowntime = analyticsData.reduce((sum, a) => sum + (Number(a.downtime_minutes) || 0), 0) / Math.max(analyticsData.length, 1)
    const totalCost = analyticsData.reduce((sum, a) => sum + (Number(a.maintenance_cost) || 0), 0)

    const prompt = `Analyze this shopping cart's maintenance data and predict maintenance needs:

Cart ID: ${cart_id}
Current Status: ${cart.status}
Last Maintenance: ${cart.last_maintenance}

30-Day Usage Statistics:
- Total Usage Hours: ${totalUsageHours.toFixed(1)}
- Total Issues Reported: ${totalIssues}
- Average Downtime (minutes): ${avgDowntime.toFixed(1)}
- Total Maintenance Cost: $${totalCost.toFixed(2)}

Recent Daily Data (last 7 days):
${analyticsData.slice(0, 7).map(a => 
  `- ${a.metric_date}: ${a.usage_hours}h usage, ${a.issues_reported} issues, ${a.downtime_minutes}min downtime`
).join('\n')}

Current Issues: ${cart.issues?.join(', ') || 'None reported'}

Based on this data, provide:
1. Maintenance risk level (low/medium/high/critical)
2. Predicted days until maintenance needed
3. Key concerns identified
4. Recommended maintenance actions
5. Preventive measures

Keep your response concise and actionable.`

    // Call Lovable AI for predictive analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a maintenance prediction AI. Analyze equipment usage patterns and predict maintenance needs with specific, actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI analysis failed: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const prediction = aiData.choices[0].message.content

    // Calculate simple risk score based on metrics
    const riskScore = calculateRiskScore({
      usageHours: totalUsageHours,
      issuesCount: totalIssues,
      downtime: avgDowntime,
      daysSinceLastMaintenance: cart.last_maintenance ? 
        Math.floor((new Date().getTime() - new Date(cart.last_maintenance).getTime()) / (1000 * 60 * 60 * 24)) : 999
    })

    return new Response(
      JSON.stringify({
        success: true,
        cart_id,
        risk_score: riskScore,
        risk_level: getRiskLevel(riskScore),
        ai_prediction: prediction,
        metrics: {
          total_usage_hours: totalUsageHours,
          total_issues: totalIssues,
          avg_downtime: avgDowntime,
          total_cost: totalCost,
          days_since_maintenance: cart.last_maintenance ? 
            Math.floor((new Date().getTime() - new Date(cart.last_maintenance).getTime()) / (1000 * 60 * 60 * 24)) : null
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Predictive maintenance error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function calculateRiskScore(data: {
  usageHours: number
  issuesCount: number
  downtime: number
  daysSinceLastMaintenance: number
}): number {
  let score = 0
  
  // Usage hours contribution (0-30 points)
  if (data.usageHours > 200) score += 30
  else if (data.usageHours > 150) score += 20
  else if (data.usageHours > 100) score += 10
  
  // Issues reported contribution (0-30 points)
  if (data.issuesCount > 5) score += 30
  else if (data.issuesCount > 3) score += 20
  else if (data.issuesCount > 1) score += 10
  
  // Downtime contribution (0-20 points)
  if (data.downtime > 120) score += 20
  else if (data.downtime > 60) score += 15
  else if (data.downtime > 30) score += 10
  
  // Days since maintenance contribution (0-20 points)
  if (data.daysSinceLastMaintenance > 90) score += 20
  else if (data.daysSinceLastMaintenance > 60) score += 15
  else if (data.daysSinceLastMaintenance > 30) score += 10
  
  return Math.min(score, 100)
}

function getRiskLevel(score: number): string {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}
