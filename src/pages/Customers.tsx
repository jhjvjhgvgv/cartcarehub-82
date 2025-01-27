import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { PlusCircle, Building2, Phone, Mail, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CustomerFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
}

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([
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

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  const form = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone: "",
      location: "",
    },
  });

  const handleAddCustomer = (data: CustomerFormData) => {
    const newCustomer = {
      id: customers.length + 1,
      ...data,
      totalCarts: 0,
    };
    setCustomers([...customers, newCustomer]);
    setIsNewCustomerOpen(false);
    form.reset();
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const handleEditCustomer = (data: CustomerFormData) => {
    if (selectedCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, ...data }
          : customer
      );
      setCustomers(updatedCustomers);
      setIsEditCustomerOpen(false);
      setSelectedCustomer(null);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    }
  };

  const CustomerForm = ({ onSubmit, initialData = null }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact person" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialData ? "Update Customer" : "Add Customer"}
        </Button>
      </form>
    </Form>
  );

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
              <CustomerForm onSubmit={handleAddCustomer} />
            </DialogContent>
          </Dialog>
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
                        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                form.reset(customer);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Customer</DialogTitle>
                            </DialogHeader>
                            <CustomerForm
                              onSubmit={handleEditCustomer}
                              initialData={selectedCustomer}
                            />
                          </DialogContent>
                        </Dialog>
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