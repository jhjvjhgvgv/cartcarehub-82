
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
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

interface SortConfig {
  key: keyof Customer | null;
  direction: 'ascending' | 'descending';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

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

  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCustomers = useMemo(() => {
    // First filter by search query
    let result = customers.filter((customer) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.contact.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.location.toLowerCase().includes(searchLower)
      );
    });

    // Then sort if needed
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Customer];
        const bValue = b[sortConfig.key as keyof Customer];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          // Handle numbers
          const numA = Number(aValue);
          const numB = Number(bValue);
          return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
        }
      });
    }

    return result;
  }, [customers, searchQuery, sortConfig]);

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-primary">Customer Management</h1>
          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto px-5 py-2.5">
                <PlusCircle className="mr-2 h-4 w-4" />
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

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle>All Customers</CardTitle>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-18rem)]">
              <div className="p-4">
                <CustomerList
                  customers={filteredAndSortedCustomers}
                  onEdit={(customer) => {
                    setSelectedCustomer(customer);
                    setIsEditCustomerOpen(true);
                  }}
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
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
