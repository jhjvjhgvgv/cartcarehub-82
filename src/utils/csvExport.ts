
import { Cart } from "@/types/cart";

/**
 * Convert cart data to CSV format and trigger download
 */
export function exportCartsToCSV(carts: Cart[], filename = "carts-export.csv") {
  // Define the columns for the CSV
  const columns = [
    "ID",
    "QR Code",
    "Store",
    "Status",
    "Last Maintenance",
    "Issues"
  ];

  // Create CSV header row
  let csvContent = columns.join(",") + "\n";

  // Add data rows
  carts.forEach(cart => {
    // Format issues to avoid comma problems in CSV
    const issuesFormatted = cart.issues && cart.issues.length 
      ? `"${cart.issues.join("; ")}"`
      : "";
    
    const row = [
      cart.id,
      cart.qr_code || "",
      cart.store || "",
      cart.status || "",
      cart.lastMaintenance || "",
      issuesFormatted
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
