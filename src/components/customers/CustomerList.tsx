import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Pencil } from "lucide-react";

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
          <TableRow 
            key={customer.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/store/${customer.id}`)}
          >
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
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onEdit(customer)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};