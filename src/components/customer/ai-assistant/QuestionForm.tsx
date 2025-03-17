
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

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
      <div>
        <Textarea
          placeholder="Ask about cart management, maintenance schedules, inventory, etc..."
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
  );
}
