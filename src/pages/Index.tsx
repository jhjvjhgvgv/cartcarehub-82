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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
        
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

        <Card>
          <CardHeader>
            <CardTitle>Stores Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
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