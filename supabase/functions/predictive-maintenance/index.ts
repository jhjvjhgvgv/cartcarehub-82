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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { cart_id } = await req.json()

    if (!cart_id) {
      throw new Error('cart_id is required')
    }

    // Fetch cart details from the carts table
    const { data: cart, error: cartError } = await supabaseClient
      .from('carts')
      .select('id, status, store_org_id, asset_tag, qr_token, model, notes, created_at, updated_at')
      .eq('id', cart_id)
      .single()

    if (cartError) throw cartError
    if (!cart) throw new Error('Cart not found')

    // Fetch recent inspections for this cart
    const { data: inspections, error: inspectionsError } = await supabaseClient
      .from('inspections')
      .select('*')
      .eq('cart_id', cart_id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (inspectionsError) throw inspectionsError

    // Fetch open issues for this cart
    const { data: issues, error: issuesError } = await supabaseClient
      .from('issues')
      .select('*')
      .eq('cart_id', cart_id)
      .eq('status', 'open')

    if (issuesError) throw issuesError

    // Calculate metrics from actual data
    const inspectionData = inspections || []
    const openIssues = issues || []
    
    const avgHealthScore = inspectionData.length > 0 
      ? inspectionData.reduce((sum, i) => sum + (i.health_score || 100), 0) / inspectionData.length 
      : 100
    
    const totalInspections = inspectionData.length
    const totalOpenIssues = openIssues.length
    const highSeverityIssues = openIssues.filter(i => i.severity === 'high' || i.severity === 'critical').length
    
    // Calculate days since last inspection
    const lastInspection = inspectionData[0]
    const daysSinceLastInspection = lastInspection 
      ? Math.floor((new Date().getTime() - new Date(lastInspection.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const prompt = `Analyze this shopping cart's maintenance data and predict maintenance needs:

Cart ID: ${cart_id}
Asset Tag: ${cart.asset_tag || 'Not set'}
Model: ${cart.model || 'Unknown'}
Current Status: ${cart.status}
Created: ${cart.created_at}

Inspection History (last 30 days):
- Total Inspections: ${totalInspections}
- Average Health Score: ${avgHealthScore.toFixed(1)}%
- Days Since Last Inspection: ${daysSinceLastInspection ?? 'Never inspected'}

Open Issues:
- Total Open Issues: ${totalOpenIssues}
- High/Critical Severity Issues: ${highSeverityIssues}
${openIssues.slice(0, 5).map(i => `  - ${i.category || 'General'}: ${i.description || 'No description'} (${i.severity})`).join('\n')}

Recent Inspections:
${inspectionData.slice(0, 5).map(i => 
  `- ${new Date(i.created_at).toLocaleDateString()}: Score ${i.health_score}, Status: ${i.reported_status}`
).join('\n')}

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

    // Calculate simple risk score based on actual metrics
    const riskScore = calculateRiskScore({
      healthScore: avgHealthScore,
      openIssues: totalOpenIssues,
      highSeverityIssues: highSeverityIssues,
      daysSinceLastInspection: daysSinceLastInspection ?? 999
    })

    return new Response(
      JSON.stringify({
        success: true,
        cart_id,
        risk_score: riskScore,
        risk_level: getRiskLevel(riskScore),
        ai_prediction: prediction,
        metrics: {
          avg_health_score: avgHealthScore,
          total_inspections: totalInspections,
          total_open_issues: totalOpenIssues,
          high_severity_issues: highSeverityIssues,
          days_since_last_inspection: daysSinceLastInspection
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
  healthScore: number
  openIssues: number
  highSeverityIssues: number
  daysSinceLastInspection: number
}): number {
  let score = 0
  
  // Health score contribution (0-30 points) - lower health = higher risk
  if (data.healthScore < 50) score += 30
  else if (data.healthScore < 70) score += 20
  else if (data.healthScore < 85) score += 10
  
  // Open issues contribution (0-30 points)
  if (data.openIssues > 5) score += 30
  else if (data.openIssues > 3) score += 20
  else if (data.openIssues > 1) score += 10
  
  // High severity issues contribution (0-20 points)
  if (data.highSeverityIssues > 2) score += 20
  else if (data.highSeverityIssues > 0) score += 15
  
  // Days since inspection contribution (0-20 points)
  if (data.daysSinceLastInspection > 30) score += 20
  else if (data.daysSinceLastInspection > 14) score += 15
  else if (data.daysSinceLastInspection > 7) score += 10
  
  return Math.min(score, 100)
}

function getRiskLevel(score: number): string {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}
