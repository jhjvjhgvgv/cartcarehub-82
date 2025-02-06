import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

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

  // Calculate the position of the cart along the circular path
  const radius = 40; // Radius of the circle in pixels
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const angle = (progress / 100) * 2 * Math.PI;
  const cartX = radius * Math.sin(angle);
  const cartY = -radius * Math.cos(angle);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 space-y-4">
        <h2 className="text-3xl font-bold text-center text-primary-800 mb-8">
          Cart Repair Pros
        </h2>
        
        <div className="relative w-32 h-32 mx-auto">
          {/* Background circle */}
          <svg
            className="absolute transform -rotate-90 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-gray-200 dark:text-gray-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r={radius}
              cx="50"
              cy="50"
            />
            {/* Progress circle with gradient */}
            <circle
              className="transition-all duration-20 ease-linear"
              strokeWidth="4"
              stroke="url(#gradient)"
              fill="none"
              r={radius}
              cx="50"
              cy="50"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            {/* Define the gradient */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Shopping cart icon */}
          <div
            className="absolute left-1/2 top-1/2 transition-transform duration-20 ease-linear"
            style={{
              transform: `translate(${cartX}px, ${cartY}px) translate(-50%, -50%) rotate(${angle}rad)`,
            }}
          >
            <ShoppingCart 
              className="w-6 h-6 text-primary-600 drop-shadow-lg" 
            />
          </div>
        </div>
        
        <div className="text-center space-y-2 mt-8">
          <p className="text-gray-500">
            Loading your dashboard...
          </p>
          <p className="text-primary-600 text-sm font-medium">
            Wheeling in your cart maintenance dashboard! 🛒
          </p>
        </div>
      </div>
    </div>
  );
};