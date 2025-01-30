import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Cart {
  id: number;
  cartNumber: string;
  status: "active" | "maintenance" | "retired";
  lastMaintenance: string;
  issues: string[];
}

interface StoreCartsTableProps {
  carts: Cart[];
  onEditCart: (cart: Cart) => void;
}

export function StoreCartsTable({ carts, onEditCart }: StoreCartsTableProps) {
  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cart Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart.id}>
              <TableCell className="font-medium">{cart.cartNumber}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    cart.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {cart.status}
                </span>
              </TableCell>
              <TableCell>{cart.lastMaintenance}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEditCart(cart)}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}