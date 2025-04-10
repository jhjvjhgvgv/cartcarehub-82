
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique identifier for a cart QR code
 * Format: CART-{uuid}-{timestamp}
 */
export const generateUniqueQRCode = (): string => {
  const uuid = uuidv4().substring(0, 8);
  const timestamp = Date.now().toString().substring(8);
  return `CART-${uuid}-${timestamp}`;
};

/**
 * Validates a QR code to ensure it follows the expected format
 * @param qrCode The QR code to validate
 * @returns True if the QR code is valid, false otherwise
 */
export const isValidQRCode = (qrCode: string): boolean => {
  // Accept both the CART-uuid-timestamp format and the legacy QR-number format
  return /^CART-[a-z0-9]{8}-\d+$/.test(qrCode) || /^QR-\d+$/.test(qrCode);
};

/**
 * Generates a URL for a cart QR code that links to the cart details
 */
export const generateCartQRCodeURL = (cartId: string): string => {
  // Use the new domain instead of window.location.origin
  const baseUrl = "https://cartrepairpros.com";
  return `${baseUrl}/carts/${cartId}`;
};
