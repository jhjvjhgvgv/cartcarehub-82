
import { useState, useEffect } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

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
          if (onLoadingComplete) {
            setTimeout(onLoadingComplete, 500); // Add a small delay before completion
          }
          return 100;
        }
        return prevProgress + 2; // Increase speed slightly
      });
    }, 20);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg mb-4 relative" style={{ width: '120px', height: '120px' }}>
              <ShoppingCart className="w-full h-full text-primary-600 animate-[gentle-bounce_2s_ease-in-out_infinite]" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Cart Repair Pros
          </h1>
          <p className="text-sm sm:text-base text-primary-100">
            Smart Cart Management System
          </p>
        </div>

        {/* Progress circle */}
        <div className="mt-8 relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-200 to-blue-400 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-white/90 text-sm font-medium">
            {progress < 100 ? "Loading..." : "Ready!"}
          </p>
          <p className="text-white/70 text-xs">
            {progress < 40 ? "Initializing cart system..." : 
             progress < 70 ? "Loading maintenance tools..." : 
             progress < 90 ? "Preparing your dashboard..." :
             "Let's roll!"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center text-white/50 text-xs">
        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
        <span>Cart Repair Pros</span>
      </div>
    </div>
  );
};
