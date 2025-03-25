import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { Cart } from "@/types/cart";
import * as QRCodeReact from 'qrcode.react';
import { generateCartQRCodeURL } from '@/utils/qr-generator';

interface CartQRCodeProps {
  cart: Cart;
  showCartInfo?: boolean;
}

export const CartQRCode: React.FC<CartQRCodeProps> = ({ cart, showCartInfo = true }) => {
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Function to handle QR code printing
  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = qrCardRef.current?.innerHTML || '';
    
    const windowPrint = window.open('', '', 'height=500,width=500');
    if (windowPrint) {
      windowPrint.document.write('<html><head><title>Print QR Code</title>');
      windowPrint.document.write('<style>');
      windowPrint.document.write(`
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .qr-container { text-align: center; }
        .qr-code { margin: 20px auto; }
        .cart-info { margin-top: 15px; }
        .cart-id { font-size: 0.8rem; color: #666; margin-bottom: 10px; }
      `);
      windowPrint.document.write('</style></head><body>');
      windowPrint.document.write('<div class="qr-container">');
      windowPrint.document.write(`<h2>Cart QR Code</h2>`);
      windowPrint.document.write(`<div class="qr-code">${qrCardRef.current?.querySelector('.qr-canvas')?.outerHTML || ''}</div>`);
      
      if (showCartInfo) {
        windowPrint.document.write(`<div class="cart-info">`);
        windowPrint.document.write(`<p><strong>Store:</strong> ${cart.store || 'N/A'}</p>`);
        windowPrint.document.write(`<p><strong>Status:</strong> ${cart.status || 'N/A'}</p>`);
        windowPrint.document.write(`<p class="cart-id">ID: ${cart.qr_code || 'N/A'}</p>`);
        windowPrint.document.write(`</div>`);
      }
      
      windowPrint.document.write('</div></body></html>');
      windowPrint.document.close();
      windowPrint.focus();
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 250);
    }
  };

  // Function to download QR code as an image
  const handleDownload = () => {
    const canvas = document.getElementById('cart-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cart-qr-code-${cart.id}.png`;
      link.href = url;
      link.click();
    }
  };

  const qrCodeValue = generateCartQRCodeURL(cart.id);

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Cart QR Code</CardTitle>
        <CardDescription className="text-center">
          Scan to access cart information
        </CardDescription>
      </CardHeader>
      <CardContent ref={qrCardRef}>
        <div className="flex flex-col items-center">
          <div className="qr-canvas mb-4">
            <QRCodeReact.QRCodeSVG
              id="cart-qr-code"
              value={qrCodeValue}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          {showCartInfo && (
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Store: {cart.store}</p>
              <p className="text-sm">Status: {cart.status}</p>
              <p className="text-xs text-muted-foreground mt-2">QR Code: {cart.qr_code}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button 
          onClick={handlePrint} 
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button 
          onClick={handleDownload} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};
