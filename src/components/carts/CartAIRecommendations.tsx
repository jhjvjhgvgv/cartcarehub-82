import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"
import { Cart, CartWithStore, getStatusLabel } from "@/types/cart"
import { useGemini } from "@/hooks/use-gemini"
import { cn } from "@/lib/utils"

interface CartAIRecommendationsProps {
  cart: Cart | CartWithStore
}

export function CartAIRecommendations({ cart }: CartAIRecommendationsProps) {
  const { generateResponse, isLoading, error, result, clearResult } = useGemini()
  const [expanded, setExpanded] = useState(false)

  // Get store name from CartWithStore if available
  const storeName = 'store_name' in cart ? cart.store_name : null;

  const handleGenerateRecommendations = async () => {
    clearResult()

    // Format cart data for the prompt
    const cartData = `
      Cart ID: ${cart.id}
      QR Token: ${cart.qr_token}
      Asset Tag: ${cart.asset_tag || 'N/A'}
      Store: ${storeName || cart.store_org_id}
      Status: ${getStatusLabel(cart.status)}
      Model: ${cart.model || 'Unknown'}
      Notes: ${cart.notes || 'None'}
      Last Updated: ${cart.updated_at}
    `

    const prompt = `Analyze the following shopping cart data and provide specific maintenance recommendations. 
      Focus on prioritizing issues and suggesting preventative actions based on the cart's current status and history.
      
      ${cartData}
      
      Format your response in these sections:
      1. Summary
      2. Prioritized Maintenance Recommendations (3-5 bullet points)
      3. Next Steps
    `

    await generateResponse(prompt, "maintenance")
  }

  return (
    <Card className={cn(
      "transition-all duration-200 overflow-hidden",
      expanded ? "max-h-[1000px]" : "max-h-[400px]"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Maintenance Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result && !isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Get AI-powered maintenance recommendations for this cart based on its history and status.
            </p>
            <Button
              onClick={handleGenerateRecommendations}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing cart data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-red-800 font-medium">Error generating recommendations</p>
            <p className="text-red-700 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateRecommendations}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {result && (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line">{result}</div>
          </div>
        )}
      </CardContent>
      {result && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateRecommendations}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
