import { useState, useMemo } from "react";
import { Cart, CartWithStore } from "@/types/cart";

export function useCartFiltering(initialCarts: (Cart | CartWithStore)[]) {
  const [carts, setCarts] = useState<(Cart | CartWithStore)[]>(initialCarts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter and sort carts
  const filteredAndSortedCarts = useMemo(() => {
    // Filter by search query and status
    let result = carts.filter(cart => {
      const storeName = 'store_name' in cart ? (cart.store_name || '') : '';
      const matchesSearch = 
        cart.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.qr_token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cart.asset_tag || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        storeName.toLowerCase().includes(searchQuery.toLowerCase());
      
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
          const storeA = 'store_name' in a ? (a.store_name || '') : '';
          const storeB = 'store_name' in b ? (b.store_name || '') : '';
          comparison = storeA.localeCompare(storeB);
          break;
        case "updated_at":
          comparison = (a.updated_at || "").localeCompare(b.updated_at || "");
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
