import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 0.5; // Reduced increment for even smoother animation
      });
    }, 40); // Slightly increased interval for slower overall animation

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 space-y-4">
        <h2 className="text-2xl font-bold text-center text-primary-800 mb-8">
          CartCareHub
        </h2>
        
        <div className="relative w-full h-8">
          <Progress value={progress} className="h-4" />
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              "transition-all duration-700 ease-linear", // Increased duration and changed to linear for smoother cart movement
              "transform -translate-x-1/2"
            )}
            style={{ left: `${progress}%` }}
          >
            <ShoppingCart 
              className="w-8 h-8 text-primary-600" 
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                animation: "gentle-bounce 3s infinite" // Slowed down the bounce animation
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