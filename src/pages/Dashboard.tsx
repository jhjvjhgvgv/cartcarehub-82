
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, ShoppingCart, ChevronRight, BarChart, Percent, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const stores = [
    {
      id: 1,
      name: "SuperMart Downtown",
      location: "123 Main St",
      totalCarts: 50,
      activeCarts: 45,
      maintenanceNeeded: 5,
      utilizationRate: 90,
      maintenanceRate: 10,
    },
    {
      id: 2,
      name: "FreshMart Heights",
      location: "456 Park Ave",
      totalCarts: 75,
      activeCarts: 70,
      maintenanceNeeded: 5,
      utilizationRate: 93,
      maintenanceRate: 7,
    },
    {
      id: 3,
      name: "Value Grocery West",
      location: "789 West Blvd",
      totalCarts: 25,
      activeCarts: 15,
      maintenanceNeeded: 10,
      utilizationRate: 60,
      maintenanceRate: 40,
    },
  ];

  const stats = {
    totalCarts: stores.reduce((sum, store) => sum + store.totalCarts, 0),
    activeCarts: stores.reduce((sum, store) => sum + store.activeCarts, 0),
    maintenanceNeeded: stores.reduce((sum, store) => sum + store.maintenanceNeeded, 0),
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getMaintenanceColor = (rate: number) => {
    if (rate <= 10) return "text-green-600";
    if (rate <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="h-full w-full flex flex-col space-y-4 p-2 md:p-4 overflow-x-hidden">
        <div className="flex items-center space-x-2 px-2">
          <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
          <h1 className="text-base md:text-2xl font-bold text-gray-900">Store Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 px-2">
          <Card 
            className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-600 cursor-pointer"
            onClick={() => navigate('/carts')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-full">
                <Building2 className="w-4 md:w-5 h-4 md:h-5 text-primary-700" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-gray-500">Total Stores</p>
                <p className="text-sm md:text-xl font-bold text-gray-900">{stores.length}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-600 cursor-pointer"
            onClick={() => navigate('/carts')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-full">
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-gray-500">Total Carts</p>
                <p className="text-sm md:text-xl font-bold text-gray-900">{stats.totalCarts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-yellow-600" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs md:text-sm text-gray-500">Needs Maintenance</p>
                <p className="text-sm md:text-xl font-bold text-gray-900">{stats.maintenanceNeeded}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Analytics Chart */}
        <div className="px-2">
          <AnalyticsChart />
        </div>

        <Card className="flex-1 mx-2">
          <CardHeader className="py-2 md:py-3">
            <CardTitle className="text-base md:text-lg">Stores Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%] text-xs md:text-sm">Store Name</TableHead>
                      <TableHead className="w-[20%] text-xs md:text-sm">Location</TableHead>
                      <TableHead className="text-right w-[25%] text-xs md:text-sm">Cart Status</TableHead>
                      <TableHead className="text-right w-[15%] text-xs md:text-sm">Utilization</TableHead>
                      <TableHead className="text-right w-[15%] text-xs md:text-sm">Maintenance</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.map((store) => (
                      <TableRow 
                        key={store.id}
                        className="cursor-pointer hover:bg-primary-50 transition-colors min-h-[140px] md:min-h-[60px]"
                        onClick={() => navigate(`/store/${store.id}`, { state: { storeName: store.name } })}
                      >
                        <TableCell className="font-medium py-4 text-xs md:text-sm">
                          <div className="flex flex-col md:flex-row items-start md:items-center">
                            {store.name}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-xs md:text-sm">
                          <div className="flex flex-col md:flex-row items-start md:items-center">
                            {store.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex flex-col md:flex-row justify-end items-end md:items-center space-y-1 md:space-y-0 md:space-x-2">
                            <ShoppingCart className="w-4 h-4 text-primary-600" />
                            <span className="text-xs md:text-sm">{store.activeCarts}/{store.totalCarts}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex flex-col md:flex-row justify-end items-end md:items-center space-y-1 md:space-y-0 md:space-x-2">
                            <Percent className={`w-4 h-4 ${getUtilizationColor(store.utilizationRate)}`} />
                            <span className={`text-xs md:text-sm ${getUtilizationColor(store.utilizationRate)}`}>
                              {store.utilizationRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex flex-col md:flex-row justify-end items-end md:items-center space-y-1 md:space-y-0 md:space-x-2">
                            <AlertTriangle className={`w-4 h-4 ${getMaintenanceColor(store.maintenanceRate)}`} />
                            <span className={`text-xs md:text-sm ${getMaintenanceColor(store.maintenanceRate)}`}>
                              {store.maintenanceRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
