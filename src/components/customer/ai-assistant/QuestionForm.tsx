
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, ShoppingCart } from "lucide-react";

interface QuestionFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export function QuestionForm({ onSubmit, isLoading }: QuestionFormProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    onSubmit(question);
    setQuestion("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <ShoppingCart className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
        <Textarea
          placeholder="Ask about cart management, maintenance schedules, inventory, etc..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[100px] pl-10"
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        className="flex items-center gap-2 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800" 
        disabled={isLoading || !question.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding your answer...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Get Expert Advice
          </>
        )}
      </Button>
    </form>
  );
}
