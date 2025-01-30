import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";

const Store = () => {
  const { id } = useParams();

  // This would typically come from an API, using dummy data for now
  const storeData = {
    id: Number(id),
    name: "SuperMart Downtown",
    location: "123 Main St",
    totalCarts: 50,
    activeCarts: 45,
    maintenanceNeeded: 5,
    carts: [
      { id: 1, cartNumber: "CART-001", status: "active", lastMaintenance: "2024-01-15" },
      { id: 2, cartNumber: "CART-002", status: "maintenance", lastMaintenance: "2024-01-10" },
      { id: 3, cartNumber: "CART-003", status: "active", lastMaintenance: "2024-01-20" },
    ]
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col space-y-4 p-2 md:p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{storeData.name}</h1>
          <p className="text-sm text-gray-500">{storeData.location}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <Card className="p-3 md:p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-full">
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Carts</p>
                <p className="text-lg md:text-xl font-bold text-gray-900">{storeData.totalCarts}</p>
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
                <p className="text-lg md:text-xl font-bold text-gray-900">{storeData.activeCarts}</p>
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
                <p className="text-lg md:text-xl font-bold text-gray-900">{storeData.maintenanceNeeded}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="py-2 md:py-3">
            <CardTitle>Carts Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cart Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeData.carts.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell className="font-medium">{cart.cartNumber}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          cart.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cart.status}
                        </span>
                      </TableCell>
                      <TableCell>{cart.lastMaintenance}</TableCell>
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

export default Store;