
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
 * Generates a URL for a cart QR code that links to the cart details
 */
export const generateCartQRCodeURL = (cartId: string): string => {
  // This will be the URL that the QR code will point to
  // When someone scans the QR code, they will be taken to this URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/customer/cart/${cartId}`;
};
