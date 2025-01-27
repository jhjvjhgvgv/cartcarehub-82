import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerList } from "@/components/customers/CustomerList";

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  totalCarts: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([
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
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  const handleAddCustomer = (data: Omit<Customer, "id" | "totalCarts">) => {
    const newCustomer = {
      id: customers.length + 1,
      ...data,
      totalCarts: 0,
    };
    setCustomers([...customers, newCustomer]);
    setIsNewCustomerOpen(false);
  };

  const handleEditCustomer = (data: Omit<Customer, "id" | "totalCarts">) => {
    if (selectedCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, ...data }
          : customer
      );
      setCustomers(updatedCustomers);
      setIsEditCustomerOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Add New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <CustomerForm onSubmit={handleAddCustomer} onCancel={() => setIsNewCustomerOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <CustomerList
                customers={customers}
                onEdit={(customer) => {
                  setSelectedCustomer(customer);
                  setIsEditCustomerOpen(true);
                }}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <CustomerForm
                initialData={selectedCustomer}
                onSubmit={handleEditCustomer}
                onCancel={() => {
                  setIsEditCustomerOpen(false);
                  setSelectedCustomer(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Customers;