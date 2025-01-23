import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";

const Index = () => {
  // Dummy data for initial display
  const stats = {
    totalCarts: 150,
    activeCarts: 130,
    maintenanceNeeded: 20,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Carts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCarts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Carts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCarts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Needs Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.maintenanceNeeded}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Cart #A123 Maintenance</p>
                <p className="text-sm text-gray-500">Routine check completed</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Cart #B456 Issue Reported</p>
                <p className="text-sm text-gray-500">Wheel alignment needed</p>
              </div>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;