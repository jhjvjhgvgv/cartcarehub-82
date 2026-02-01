import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { useToast } from "@/hooks/use-toast"
import { Cart } from "@/types/cart"

interface UseQRScannerProps {
  onQRCodeDetected: (qrCode: string) => void
  carts: Cart[]
  onSetExistingCart: (cart: Cart | null) => void
}

export function useQRScanner({ 
  onQRCodeDetected, 
  carts,
  onSetExistingCart
}: UseQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          showTorchButtonIfSupported: false,
          showZoomSliderIfSupported: false,
        },
        /* verbose= */ false
      )

      const onScanSuccess = async (decodedText: string) => {
        try {
          if (scannerRef.current) {
            await scannerRef.current.clear()
            scannerRef.current = null
          }
          setIsScanning(false)
          
          // Extract QR token from scanned text
          let qrToken = decodedText;
          
          // Handle URL format (e.g., https://domain.com/inspection?qr=CART-xxx)
          if (decodedText.includes('/inspection?qr=')) {
            try {
              const url = new URL(decodedText);
              qrToken = url.searchParams.get('qr') || decodedText;
            } catch {
              // If URL parsing fails, continue with original text
            }
          }
          // Handle direct cart QR codes
          else if (decodedText.startsWith("CART-") || decodedText.startsWith("QR-")) {
            qrToken = decodedText.split('?')[0]; // Remove cache-busting params
          }
          // Handle URL format with cart path
          else if (decodedText.includes("/carts/")) {
            // Extract cart ID from URL
            const match = decodedText.match(/\/carts\/([^/?]+)/);
            if (match) {
              qrToken = match[1];
            }
          }
          
          // Navigate to inspection page with QR token
          window.location.href = `/inspection?qr=${encodeURIComponent(qrToken)}`;
          
        } catch (error) {
          console.error("Error during QR scan:", error)
          toast({
            title: "Scan Error",
            description: "Failed to process QR code. Please try again.",
            variant: "destructive",
          })
        }
      }

      const onScanError = (err: any) => {
        // Ignore common "no QR code found" messages to reduce noise
        const errorMessage = err.toString().toLowerCase()
        if (!errorMessage.includes("no qr code") && 
            !errorMessage.includes("no barcode") && 
            !errorMessage.includes("no multiformat readers")) {
          console.error("QR Scanner error:", err)
        }
      }

      scannerRef.current.render(onScanSuccess, onScanError)
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (err) {
          console.error("Error clearing scanner:", err)
        } finally {
          scannerRef.current = null
        }
      }
    }
  }, [isScanning, toast])

  const handleTestScan = () => {
    // Generate a valid QR code for testing and navigate to inspection
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const testCode = `CART-${random}-${timestamp.toString().substring(8)}`;
    window.location.href = `/inspection?qr=${encodeURIComponent(testCode)}`;
  }

  return {
    isScanning,
    setIsScanning,
    handleTestScan
  }
}
