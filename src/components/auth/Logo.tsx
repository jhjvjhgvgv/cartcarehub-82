
import React from "react";
import { ShoppingCart } from "lucide-react";

export const Logo = () => {
  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-full shadow-lg mb-4 relative" style={{ width: '120px', height: '120px' }}>
          <ShoppingCart className="w-full h-full text-primary-600 animate-bounce" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg animate-fade-in">
        Cart Repair Pros
      </h1>
      <p className="text-sm sm:text-base text-primary-100 animate-fade-in">
        Smart Cart Management System
      </p>
    </div>
  );
};
