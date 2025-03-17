
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Sparkles, Loader2, Send, AlertTriangle, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useGemini } from "@/hooks/use-gemini"
import { useToast } from "@/components/ui/use-toast"

export function AICartAssistant() {
  const { generateResponse, isLoading, error, result, clearResult, clearError } = useGemini()
  const [question, setQuestion] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    clearResult()
    clearError()
    
    try {
      await generateResponse(question, "customer")
      setQuestion("")
    } catch (err) {
      console.error("Error submitting question:", err)
      // Error is already handled by the useGemini hook
    }
  }

  const handleRetry = async () => {
    if (!question.trim() || isLoading) return
    clearError()
    
    toast({
      title: "Retrying request",
      description: "Attempting to connect to the assistant again...",
    })
    
    try {
      await generateResponse(question, "customer")
    } catch (err) {
      console.error("Error retrying question:", err)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Cart Care Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Have questions about shopping carts or need assistance? Ask our AI assistant!
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Unable to get AI response</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry} 
                  disabled={isLoading}
                  className="mt-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <p className="text-sm whitespace-pre-line">{result}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Textarea
              placeholder="Ask a question about shopping carts..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="flex items-center gap-2 w-full" 
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting Answer...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Question
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
