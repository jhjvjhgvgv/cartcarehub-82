import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Pencil, MapPin, ShoppingCart } from "lucide-react";

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
    <div className="w-full overflow-auto">
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
                    <Mail className="h-4 w-4 text-gray-500" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
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
  );
};