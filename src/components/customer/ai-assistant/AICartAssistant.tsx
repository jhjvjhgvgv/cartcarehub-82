
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/components/ui/use-toast";
import { ResponseDisplay } from "./ResponseDisplay";
import { QuestionForm } from "./QuestionForm";

export function AICartAssistant() {
  const { generateResponse, isLoading, error, result, clearResult, clearError } = useGemini();
  const { toast } = useToast();

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return;

    clearResult();
    clearError();
    
    try {
      await generateResponse(question, "customer");
    } catch (err) {
      console.error("Error submitting question:", err);
      // Error is already handled by the useGemini hook
    }
  };

  const handleRetry = async () => {
    clearError();
    
    toast({
      title: "Retrying request",
      description: "Attempting to connect to the assistant again...",
    });
    
    try {
      // We don't have access to the question here directly, but the useGemini hook
      // might have stored it internally. If not, this is a limitation of the current implementation.
      await generateResponse("", "customer");
    } catch (err) {
      console.error("Error retrying question:", err);
    }
  };

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
          Have questions about cart management, maintenance schedules, or best practices? Ask our AI assistant!
        </p>

        <ResponseDisplay 
          error={error} 
          result={result}
          handleRetry={handleRetry}
          isLoading={isLoading}
        />

        <QuestionForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
