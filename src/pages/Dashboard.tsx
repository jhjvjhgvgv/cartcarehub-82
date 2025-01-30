import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { ShoppingCart, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  // Dummy data for initial display
  const stores = [
    {
      id: 1,
      name: "SuperMart Downtown",
      location: "123 Main St",
      totalCarts: 50,
      activeCarts: 45,
      maintenanceNeeded: 5,
    },
    {
      id: 2,
      name: "FreshMart Heights",
      location: "456 Park Ave",
      totalCarts: 75,
      activeCarts: 70,
      maintenanceNeeded: 5,
    },
    {
      id: 3,
      name: "Value Grocery West",
      location: "789 West Blvd",
      totalCarts: 25,
      activeCarts: 15,
      maintenanceNeeded: 10,
    },
  ];

  // Calculate total statistics
  const stats = {
    totalCarts: stores.reduce((sum, store) => sum + store.totalCarts, 0),
    activeCarts: stores.reduce((sum, store) => sum + store.activeCarts, 0),
    maintenanceNeeded: stores.reduce((sum, store) => sum + store.maintenanceNeeded, 0),
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col space-y-4 p-2 md:p-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Store Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary-600 hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-full">
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Carts</p>
                <p className="text-lg md:text-xl font-bold text-gray-900">{stats.totalCarts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-600 hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-full">
                <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Active Carts</p>
                <p className="text-lg md:text-xl font-bold text-gray-900">{stats.activeCarts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-yellow-600 hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Needs Maintenance</p>
                <p className="text-lg md:text-xl font-bold text-gray-900">{stats.maintenanceNeeded}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="py-2 md:py-3">
            <CardTitle>Stores Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Carts</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>{store.location}</TableCell>
                      <TableCell>{store.totalCarts}</TableCell>
                      <TableCell className="text-green-600">{store.activeCarts}</TableCell>
                      <TableCell className="text-yellow-600">{store.maintenanceNeeded}</TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
