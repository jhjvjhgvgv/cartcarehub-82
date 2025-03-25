
import { useState, useMemo } from "react";
import { Cart } from "@/types/cart";

export function useCartFiltering(initialCarts: Cart[]) {
  const [carts, setCarts] = useState<Cart[]>(initialCarts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter and sort carts
  const filteredAndSortedCarts = useMemo(() => {
    // Filter by search query and status
    let result = carts.filter(cart => {
      const matchesSearch = 
        cart.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.store.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || cart.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    return result.sort((a, b) => {
      let comparison = 0;
      
      // Handle different sort fields
      switch (sortBy) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "store":
          comparison = a.store.localeCompare(b.store);
          break;
        case "lastMaintenance":
          comparison = (a.lastMaintenance || "").localeCompare(b.lastMaintenance || "");
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort order
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [carts, searchQuery, statusFilter, sortBy, sortOrder]);

  return {
    carts,
    setCarts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isFilterOpen,
    setIsFilterOpen,
    filteredAndSortedCarts
  };
}
