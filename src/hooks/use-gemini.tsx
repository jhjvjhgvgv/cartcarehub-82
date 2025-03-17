
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"

type GeminiRequestType = "maintenance" | "customer" | "general"

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const generateResponse = async (prompt: string, type: GeminiRequestType = "general") => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("gemini", {
        body: { prompt, type }
      })
      
      if (invokeError) {
        console.error("Supabase function error:", invokeError)
        setError(invokeError.message || "Failed to generate response")
        return null
      }
      
      if (data?.error) {
        console.error("Gemini API error:", data.error)
        setError(data.error)
        return null
      }
      
      setResult(data?.result || "No response received")
      return data?.result
    } catch (err: any) {
      console.error("Error calling Gemini API:", err)
      setError(err.message || "An unexpected error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateResponse,
    isLoading,
    error,
    result,
    clearResult: () => setResult(null),
    clearError: () => setError(null)
  }
}
