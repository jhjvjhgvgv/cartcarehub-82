import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CartStatus, getStatusLabel } from "@/types/cart";

interface LocalCart {
  id: number;
  cartNumber: string;
  status: CartStatus;
  notes: string;
}

interface StoreCartsTableProps {
  carts: LocalCart[];
  onEditCart: (cart: LocalCart) => void;
}

export function StoreCartsTable({ carts, onEditCart }: StoreCartsTableProps) {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      // Simple CSV export for local cart data
      const headers = ["Cart Number", "Status", "Notes"];
      const rows = carts.map(cart => [
        cart.cartNumber,
        getStatusLabel(cart.status),
        cart.notes || ""
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-carts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Store carts data has been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: CartStatus) => {
    switch (status) {
      case "in_service":
        return "bg-green-100 text-green-800";
      case "out_of_service":
        return "bg-yellow-100 text-yellow-800";
      case "retired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border h-full flex flex-col">
      <div className="p-2 flex justify-end">
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          disabled={carts.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Cart Number</TableHead>
            <TableHead className="w-1/3">Status</TableHead>
            <TableHead className="w-1/3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart.id}>
              <TableCell className="font-medium">{cart.cartNumber}</TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cart.status)}`}>
                  {getStatusLabel(cart.status)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditCart(cart)}
                  className="hover:bg-primary/10"
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
