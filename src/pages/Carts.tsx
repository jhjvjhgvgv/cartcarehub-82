import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, QrCode } from "lucide-react";

const Carts = () => {
  // Dummy data for initial display
  const carts = [
    {
      id: "CART-001",
      rfidTag: "RFID-A123",
      store: "SuperMart Downtown",
      status: "active",
      lastMaintenance: "2024-02-15",
      issues: ["Wheel alignment needed"],
    },
    {
      id: "CART-002",
      rfidTag: "RFID-B456",
      store: "SuperMart Downtown",
      status: "maintenance",
      lastMaintenance: "2024-01-20",
      issues: ["Handle loose", "Left wheel damaged"],
    },
    {
      id: "CART-003",
      rfidTag: "RFID-C789",
      store: "FreshMart Heights",
      status: "active",
      lastMaintenance: "2024-02-10",
      issues: [],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add New Cart
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Carts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cart ID</TableHead>
                    <TableHead>RFID Tag</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell className="font-medium">{cart.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          {cart.rfidTag}
                        </div>
                      </TableCell>
                      <TableCell>{cart.store}</TableCell>
                      <TableCell>{getStatusBadge(cart.status)}</TableCell>
                      <TableCell>{cart.lastMaintenance}</TableCell>
                      <TableCell>
                        {cart.issues.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {cart.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-gray-500">No issues reported</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
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

export default Carts;