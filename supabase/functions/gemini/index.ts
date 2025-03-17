
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
// Using the correct model name for the v1beta API - "gemini-1.5-flash" is one of the latest models
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set")
      return new Response(
        JSON.stringify({ 
          error: "AI service is currently unavailable. Please try again later or contact support.",
          details: "API key is not configured" 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, type } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Please provide a question or description" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Different prompts based on request type
    let systemPrompt = ""
    
    if (type === "maintenance") {
      systemPrompt = `You are an expert shopping cart maintenance assistant. 
      Analyze the following cart data and provide specific maintenance recommendations. 
      Focus on prioritizing issues and suggesting preventative actions.`
    } else if (type === "customer") {
      systemPrompt = `You are a helpful cart management assistant for store employees and managers.
      Answer questions about shopping cart operations, maintenance schedules, inventory management, 
      and best practices for cart maintenance and customer service.
      Assume the user is a retail professional who manages shopping carts for their store.
      Use appropriate retail and operations terminology, and provide practical advice that would be 
      relevant to someone managing carts in a retail environment. Keep responses concise and actionable.`
    } else {
      systemPrompt = `You are an AI assistant specialized in shopping cart management and maintenance.`
    }

    const fullPrompt = `${systemPrompt}\n\n${prompt}`

    console.log(`Making request to Gemini API with type: ${type}`)
    console.log(`Using API URL: ${API_URL}`)
    console.log(`Prompt: ${fullPrompt.substring(0, 100)}...`)
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      console.error("Gemini API error:", JSON.stringify(data))
      
      let userFriendlyError = "Failed to get AI response. Please try again later."
      
      // Handle specific API key errors
      if (data.error?.message?.includes("API key not valid")) {
        console.error("Invalid API key detected")
        return new Response(
          JSON.stringify({ 
            error: "AI service is temporarily unavailable. Our team has been notified.",
            details: "API key validation error" 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: userFriendlyError, details: data.error }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."
    
    return new Response(
      JSON.stringify({ result: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in Gemini function:", error)
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred with the AI service. Please try again later.",
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
