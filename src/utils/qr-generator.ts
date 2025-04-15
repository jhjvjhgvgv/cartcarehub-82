
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique identifier for a cart QR code
 * Format: CART-{uuid}-{timestamp}
 */
export const generateUniqueQRCode = (): string => {
  const uuid = uuidv4().substring(0, 8);
  const timestamp = Date.now().toString();
  return `CART-${uuid}-${timestamp.substring(8)}`;
};

/**
 * Validates a QR code to ensure it follows the expected format
 * @param qrCode The QR code to validate
 * @returns True if the QR code is valid, false otherwise
 */
export const isValidQRCode = (qrCode: string): boolean => {
  // Clean the QR code by removing cache-busting parameters
  const cleanQrCode = qrCode.split('?')[0];
  
  // Accept both the CART-uuid-timestamp format and the legacy QR-number format
  return /^CART-[a-z0-9]{8}-\d+$/.test(cleanQrCode) || /^QR-\d+$/.test(cleanQrCode);
};

/**
 * Generates a URL for a cart QR code that links to the cart details
 * with multiple aggressive cache-busting parameters
 */
export const generateCartQRCodeURL = (cartId: string): string => {
  // Use the new domain instead of window.location.origin
  const baseUrl = "https://cartrepairpros.com";
  
  // Add multiple cache-busting parameters - ultra aggressive approach
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const random2 = Math.random().toString(36).substring(2);
  const random3 = Math.random().toString(36).substring(2);
  
  return `${baseUrl}/carts/${cartId}?t=${timestamp}&r=${random}&r2=${random2}&r3=${random3}&v=${timestamp}_${random}&v2=${timestamp}_${random2}&ts=${timestamp}&rnd=${random}_${random2}_${random3}&forceUpdate=true&nocache=true&flush=cache&invalidate=${timestamp}_${random}&clearCache=true`;
};
