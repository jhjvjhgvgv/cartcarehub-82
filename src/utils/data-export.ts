import { Cart, CartWithStore, getStatusLabel } from "@/types/cart";

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Export carts data with custom formatting
 */
export function exportCartsData(carts: (Cart | CartWithStore)[], format: 'csv' | 'json' = 'csv'): void {
  const exportData = carts.map(cart => {
    const storeName = 'store_name' in cart ? cart.store_name : cart.store_org_id;
    return {
      'QR Token': cart.qr_token,
      'Asset Tag': cart.asset_tag || '',
      'Store': storeName || '',
      'Store Org ID': cart.store_org_id,
      'Status': getStatusLabel(cart.status),
      'Model': cart.model || '',
      'Notes': cart.notes || '',
      'Updated At': cart.updated_at ? new Date(cart.updated_at).toLocaleDateString() : 'N/A',
    };
  });

  const filename = `carts-export-${new Date().toISOString().split('T')[0]}.${format}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
}

/**
 * Export maintenance requests data
 */
export function exportMaintenanceData(requests: any[], format: 'csv' | 'json' = 'csv'): void {
  const exportData = requests.map(req => ({
    'Request ID': req.id,
    'Cart ID': req.cart_id,
    'Provider': req.provider_id,
    'Type': req.request_type,
    'Priority': req.priority,
    'Status': req.status,
    'Scheduled Date': req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : 'N/A',
    'Completed Date': req.completed_date ? new Date(req.completed_date).toLocaleDateString() : 'N/A',
    'Cost': req.cost ? `$${req.cost}` : 'N/A',
    'Duration (min)': req.actual_duration || req.estimated_duration || 'N/A',
    'Description': req.description || ''
  }));

  const filename = `maintenance-export-${new Date().toISOString().split('T')[0]}.${format}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
}

/**
 * Export analytics data
 */
export function exportAnalyticsData(analytics: any[], format: 'csv' | 'json' = 'csv'): void {
  const exportData = analytics.map(data => ({
    'Date': new Date(data.metric_date).toLocaleDateString(),
    'Cart ID': data.cart_id,
    'Usage Hours': data.usage_hours,
    'Distance (km)': data.distance_traveled,
    'Maintenance Cost': data.maintenance_cost ? `$${data.maintenance_cost}` : '$0',
    'Downtime (min)': data.downtime_minutes,
    'Issues Reported': data.issues_reported,
    'Satisfaction': data.customer_satisfaction || 'N/A'
  }));

  const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
}

/**
 * Generate comprehensive business report
 */
export function generateBusinessReport(data: {
  carts: (Cart | CartWithStore)[];
  requests: any[];
  analytics: any[];
}): void {
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      total_carts: data.carts.length,
      active_carts: data.carts.filter(c => c.status === 'in_service').length,
      total_requests: data.requests.length,
      completed_requests: data.requests.filter(r => r.status === 'completed').length,
      total_cost: data.requests.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
      avg_cost: data.requests.length > 0 
        ? data.requests.reduce((sum, r) => sum + (Number(r.cost) || 0), 0) / data.requests.length 
        : 0
    },
    carts: data.carts,
    maintenance_requests: data.requests,
    analytics: data.analytics
  };

  exportToJSON([report], `business-report-${new Date().toISOString().split('T')[0]}.json`);
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from CSV
 */
export async function importFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index];
            });
            return obj;
          });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Import data from JSON
 */
export async function importFromJSON(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(Array.isArray(data) ? data : [data]);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
