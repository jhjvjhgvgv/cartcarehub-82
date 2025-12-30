
import { Cart, CartWithStore, getStatusLabel } from "@/types/cart";

/**
 * Convert cart data to CSV format and trigger download
 */
export function exportCartsToCSV(carts: (Cart | CartWithStore)[], filename = "carts-export.csv") {
  // Define the columns for the CSV
  const columns = [
    "ID",
    "QR Token",
    "Asset Tag",
    "Store",
    "Status",
    "Model",
    "Notes",
    "Updated At"
  ];

  // Create CSV header row
  let csvContent = columns.join(",") + "\n";

  // Add data rows
  carts.forEach(cart => {
    const storeName = 'store_name' in cart ? cart.store_name : cart.store_org_id;
    
    const row = [
      cart.id,
      cart.qr_token || "",
      cart.asset_tag || "",
      storeName || "",
      getStatusLabel(cart.status),
      cart.model || "",
      `"${(cart.notes || "").replace(/"/g, '""')}"`,
      cart.updated_at || ""
    ];
    
    csvContent += row.join(",") + "\n";
  });

  // Create a downloadable blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Append to document, trigger download and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
