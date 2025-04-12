
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
          
          // Check if the QR code format is valid
          if (decodedText.startsWith("CART-") || decodedText.startsWith("QR-")) {
            // Super aggressive cache busting with multiple parameters
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2);
            const random2 = Math.random().toString(36).substring(2);
            onQRCodeDetected(decodedText + 
              `?_t=${timestamp}&_r=${random}&_v=${timestamp}_${random}&_ts=${timestamp}&_rnd=${random2}&forceUpdate=true&nocache=true&flush=cache&invalidate=${timestamp}_${random}`)
          } else if (decodedText.includes("/carts/")) {
            // Handle URL format with hyper-aggressive cache busting
            const separator = decodedText.includes("?") ? "&" : "?";
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2);
            const random2 = Math.random().toString(36).substring(2);
            onQRCodeDetected(decodedText + 
              `${separator}_t=${timestamp}&_r=${random}&_v=${timestamp}_${random}&_ts=${timestamp}&_rnd=${random2}&forceUpdate=true&nocache=true&flush=cache&invalidate=${timestamp}_${random}`)
          } else {
            toast({
              title: "Invalid QR Code",
              description: "The scanned QR code doesn't match the expected format for a cart.",
              variant: "destructive",
            })
          }
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
          toast({
            title: "Scan Error", 
            description: "Failed to scan QR code. Please try again.",
            variant: "destructive",
          })
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
  }, [isScanning, onQRCodeDetected, toast])

  const handleTestScan = () => {
    // Generate a valid QR code for testing with super aggressive cache busting
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const random2 = Math.random().toString(36).substring(2);
    const testCode = `CART-${random.substring(0,8)}-${timestamp.toString().substring(8)}?_t=${timestamp}&_r=${random}&_v=${timestamp}_${random}&_ts=${timestamp}&_rnd=${random2}&forceUpdate=true&nocache=true&flush=cache&invalidate=${timestamp}_${random}`;
    onQRCodeDetected(testCode)
  }

  return {
    isScanning,
    setIsScanning,
    handleTestScan
  }
}
