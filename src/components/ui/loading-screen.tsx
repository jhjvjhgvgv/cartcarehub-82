import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          onLoadingComplete?.();
          return 100;
        }
        return prevProgress + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 space-y-4">
        <h2 className="text-3xl font-bold text-center text-primary-800 mb-8">
          Cart Repair Pros
        </h2>
        
        <div className="relative w-full">
          <Progress value={progress} className="h-4 transition-all duration-300 ease-in-out" />
          <div 
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{ 
              left: `${progress}%`,
              transform: `translate(-50%, -50%)`,
              transition: 'all 20ms linear' // Synchronized with the progress update interval
            }}
          >
            <ShoppingCart 
              className="w-8 h-8 text-primary-600" 
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
            />
          </div>
        </div>
        
        <p className="text-center text-gray-500 mt-4">
          Loading your dashboard...
        </p>
        <p className="text-center text-primary-600 text-sm font-medium animate-pulse">
          Wheeling in your cart maintenance dashboard! 🛒
        </p>
      </div>
    </div>
  );
};