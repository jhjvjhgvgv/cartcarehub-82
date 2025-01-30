import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Pencil, MapPin, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  totalCarts: number;
}

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export const CustomerList = ({ customers, onEdit }: CustomerListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 md:space-y-0">
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {customers.map((customer) => (
          <Card
            key={customer.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/store/${customer.id}`)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(customer);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {customer.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  {customer.totalCarts} Carts
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">Contact Person</TableHead>
              <TableHead className="min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Info
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
              </TableHead>
              <TableHead className="min-w-[120px]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Total Carts
                </div>
              </TableHead>
              <TableHead className="min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/store/${customer.id}`)}
              >
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.contact}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{customer.totalCarts}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};