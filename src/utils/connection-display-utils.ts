import { DatabaseConnectionService } from "@/services/connection/database-connection-service";

export interface ProviderDisplayInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
}

export interface StoreDisplayInfo {
  id: string;
  name: string;
  contactInfo?: string;
}

/**
 * Gets enhanced display information for maintenance providers
 */
export async function getProviderDisplayInfo(providerId: string): Promise<ProviderDisplayInfo | null> {
  try {
    // This would need to be implemented in DatabaseConnectionService
    // For now, return a fallback
    return {
      id: providerId,
      name: `Provider ${providerId.slice(0, 8)}`,
      email: 'contact@provider.com',
      isVerified: false
    };
  } catch (error) {
    console.error('Failed to get provider display info:', error);
    return null;
  }
}

/**
 * Gets enhanced display information for stores
 */
export function getStoreDisplayInfo(storeId: string): StoreDisplayInfo {
  // For stores, we can derive display info from the store ID
  // Since store IDs are now company names or meaningful identifiers
  return {
    id: storeId,
    name: storeId, // Store ID is now the company name
    contactInfo: `Contact: ${storeId}`
  };
}

/**
 * Formats connection status with appropriate colors and icons
 */
export function getConnectionStatusInfo(status: string) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        description: 'Waiting for response'
      };
    case 'accepted':
    case 'active':
      return {
        label: 'Active',
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        description: 'Connection established'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        description: 'Connection declined'
      };
    default:
      return {
        label: 'Unknown',
        variant: 'outline' as const,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        description: 'Status unknown'
      };
  }
}