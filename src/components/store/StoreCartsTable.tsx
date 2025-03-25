
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportCartsToCSV } from "@/utils/csvExport";
import { useToast } from "@/hooks/use-toast";

interface Cart {
  id: number;
  cartNumber: string;
  status: "active" | "maintenance" | "retired";
  lastMaintenance: string;
  issues: string[];
  qr_code?: string; // Added for CSV export compatibility
  store?: string; // Added for CSV export compatibility
}

interface StoreCartsTableProps {
  carts: Cart[];
  onEditCart: (cart: Cart) => void;
}

export function StoreCartsTable({ carts, onEditCart }: StoreCartsTableProps) {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      // Ensure carts have the right format for CSV export
      const exportableCarts = carts.map(cart => ({
        ...cart,
        qr_code: cart.qr_code || cart.cartNumber, // Use cartNumber if qr_code is not available
        id: typeof cart.id === 'number' ? cart.id.toString() : cart.id,
      }));
      
      exportCartsToCSV(exportableCarts as any, `store-carts-${new Date().toISOString().split('T')[0]}.csv`);
      
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
            <TableHead className="w-[180px]">Cart Number</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px]">Last Maintenance</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart.id}>
              <TableCell className="font-medium">{cart.cartNumber}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    cart.status === "active"
                      ? "bg-green-100 text-green-800"
                      : cart.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {cart.status}
                </span>
              </TableCell>
              <TableCell>{cart.lastMaintenance}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditCart(cart)}
                  className="hover:bg-primary-50"
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
