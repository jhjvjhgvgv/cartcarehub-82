
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Pencil, MapPin, ShoppingCart, ArrowDown, ArrowUp } from "lucide-react";
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

interface SortConfig {
  key: keyof Customer | null;
  direction: 'ascending' | 'descending';
}

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  sortConfig: SortConfig;
  onRequestSort: (key: keyof Customer) => void;
}

export const CustomerList = ({ customers, onEdit, sortConfig, onRequestSort }: CustomerListProps) => {
  const navigate = useNavigate();

  const renderSortIcon = (columnName: keyof Customer) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );
  };

  const getSortableHeaderProps = (columnName: keyof Customer) => {
    return {
      onClick: () => onRequestSort(columnName),
      className: "cursor-pointer hover:bg-muted/80 transition-colors px-4 py-3 text-left font-medium text-muted-foreground"
    };
  };

  return (
    <div className="space-y-4 md:space-y-0">
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {customers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-primary"
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
                      className="flex items-center gap-2 px-3 py-1"
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
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-auto border rounded-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead {...getSortableHeaderProps("name")}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead {...getSortableHeaderProps("contact")}>
                Contact Person
                {renderSortIcon("contact")}
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Info
                </div>
              </TableHead>
              <TableHead {...getSortableHeaderProps("location")}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                  {renderSortIcon("location")}
                </div>
              </TableHead>
              <TableHead {...getSortableHeaderProps("totalCarts")}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Total Carts
                  {renderSortIcon("totalCarts")}
                </div>
              </TableHead>
              <TableHead className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/store/${customer.id}`)}
                >
                  <TableCell className="font-medium text-left">{customer.name}</TableCell>
                  <TableCell className="text-left">{customer.contact}</TableCell>
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
                  <TableCell className="text-left">{customer.location}</TableCell>
                  <TableCell className="text-left">{customer.totalCarts}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-1"
                      onClick={() => onEdit(customer)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
