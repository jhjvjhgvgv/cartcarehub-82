import React from "react";
import { Card } from "@/components/ui/card";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";

interface StoreHeaderProps {
  name: string;
  location: string;
  totalCarts: number;
  activeCarts: number;
  maintenanceNeeded: number;
}

export function StoreHeader({ name, location, totalCarts, activeCarts, maintenanceNeeded }: StoreHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{name}</h1>
        <p className="text-sm text-gray-500">{location}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
        <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-full">
              <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 text-primary-700" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Total Carts</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{totalCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-full">
              <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Active Carts</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{activeCarts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-full">
              <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Needs Maintenance</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{maintenanceNeeded}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}