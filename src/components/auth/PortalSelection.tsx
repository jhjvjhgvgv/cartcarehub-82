import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Wrench, Key, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserRole = "maintenance" | "store";

interface PortalSelectionProps {
  onPortalClick: (role: UserRole) => void;
}

export const PortalSelection = ({ onPortalClick }: PortalSelectionProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm border-primary-100 animate-scale-in">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col space-y-4">
          <p className="text-center text-gray-600 text-sm sm:text-base mb-2">
            Choose your portal
          </p>
          
          <Button
            variant="outline"
            className="h-auto py-4 sm:py-6 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group"
            onClick={() => onPortalClick('maintenance')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-primary-50 rounded-full flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base sm:text-lg">Maintenance Portal</div>
                <div className="text-sm text-gray-500">For service providers</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 sm:py-6 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group"
            onClick={() => onPortalClick('store')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-primary-50 rounded-full flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base sm:text-lg">Store Portal</div>
                <div className="text-sm text-gray-500">For store managers</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
          </Button>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 flex items-center gap-2 text-sm sm:text-base group"
              onClick={() => navigate("/forgot-password")}
            >
              <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Forgot Password?
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};