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
      <div className="flex min-h-[calc(100vh-4rem)] flex-col space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <CustomerForm onSubmit={handleAddCustomer} onCancel={() => setIsNewCustomerOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="p-4">
                <CustomerList
                  customers={customers}
                  onEdit={(customer) => {
                    setSelectedCustomer(customer);
                    setIsEditCustomerOpen(true);
                  }}
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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