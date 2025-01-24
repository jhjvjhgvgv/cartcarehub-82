import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, Phone, Mail } from "lucide-react";

const Customers = () => {
  // Dummy data for initial display
  const customers = [
    {
      id: 1,
      name: "SuperMart Inc.",
      contact: "John Smith",
      email: "john@supermart.com",
      phone: "(555) 123-4567",
      location: "123 Main St, Downtown",
      totalCarts: 50,
    },
    {
      id: 2,
      name: "FreshMart Group",
      contact: "Sarah Johnson",
      email: "sarah@freshmart.com",
      phone: "(555) 987-6543",
      location: "456 Park Ave, Heights",
      totalCarts: 75,
    },
    {
      id: 3,
      name: "Value Grocery Chain",
      contact: "Mike Wilson",
      email: "mike@valuegrocery.com",
      phone: "(555) 456-7890",
      location: "789 West Blvd",
      totalCarts: 25,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add New Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Carts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.contact}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.location}</TableCell>
                      <TableCell>{customer.totalCarts}</TableCell>
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

export default Customers;