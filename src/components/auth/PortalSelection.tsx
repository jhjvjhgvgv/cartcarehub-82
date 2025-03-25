
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Wrench, Key, ArrowRight } from "lucide-react";

type UserRole = "maintenance" | "store" | "forgot-password";

interface PortalSelectionProps {
  onPortalClick: (role: UserRole) => void;
}

export const PortalSelection = ({ onPortalClick }: PortalSelectionProps) => {
  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border-none overflow-hidden animate-scale-in">
      <div className="bg-primary-600 pt-8 pb-12 px-6 relative">
        <h2 className="text-2xl font-bold text-white text-center">
          Choose Your Portal
        </h2>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary-500 rounded-tl-full" />
      </div>
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="h-auto py-5 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group rounded-xl border-gray-200"
            onClick={() => onPortalClick('maintenance')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-full flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <Wrench className="w-6 h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Maintenance Portal</div>
                <div className="text-sm text-gray-500">For service providers</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
          </Button>

          <Button
            variant="outline"
            className="h-auto py-5 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group rounded-xl border-gray-200"
            onClick={() => onPortalClick('store')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-full flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Store Portal</div>
                <div className="text-sm text-gray-500">For store managers</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
          </Button>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 flex items-center gap-2 text-sm group"
              onClick={() => onPortalClick('forgot-password')}
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
