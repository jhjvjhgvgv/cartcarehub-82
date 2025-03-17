
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShoppingCart } from "lucide-react";

interface ResponseDisplayProps {
  error: string | null;
  result: string | null;
  handleRetry: () => void;
  isLoading: boolean;
}

export function ResponseDisplay({ error, result, handleRetry, isLoading }: ResponseDisplayProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Hmm, that didn't work</p>
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              disabled={isLoading}
              className="mt-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-blue-50 border-l-4 border-primary-500 rounded-md p-4 mb-4">
        <div className="flex gap-3">
          <ShoppingCart className="h-5 w-5 text-primary-500 flex-shrink-0 mt-1" />
          <p className="text-sm whitespace-pre-line text-gray-700">{result}</p>
        </div>
      </div>
    );
  }

  return null;
}
