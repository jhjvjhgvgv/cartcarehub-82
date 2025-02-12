
import { useState, useEffect } from "react"
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

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
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
          // Stop scanning first to prevent multiple scans
          if (scanner) {
            await scanner.clear()
            setIsScanning(false)
          }

          onQRCodeDetected(decodedText)
          
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
        // Only show error for non-standard scanning issues
        if (!err.toString().includes("No QR code detected")) {
          console.error("QR Scanner error:", err)
          toast({
            title: "Scan Error", 
            description: "Failed to scan QR code. Please try again.",
            variant: "destructive",
          })
        }
      }

      scanner.render(onScanSuccess, onScanError)
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => {
          console.error("Error clearing scanner:", err)
        })
      }
    }
  }, [isScanning, onQRCodeDetected, toast])

  const handleTestScan = () => {
    const testCode = "QR-123456789"
    onQRCodeDetected(testCode)
  }

  return {
    isScanning,
    setIsScanning,
    handleTestScan
  }
}
