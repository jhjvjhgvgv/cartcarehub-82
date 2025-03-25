
import { useState } from "react"
import { Cart } from "@/types/cart"
import { QRScannerUI } from "../qr-scanner/QRScannerUI"
import { useQRScanner } from "../qr-scanner/useQRScanner"
import { useToast } from "@/hooks/use-toast"
import { generateUniqueQRCode } from "@/utils/qr-generator"

interface QRScannerProps {
  onQRCodeDetected: (qrCode: string) => void
  carts: Cart[]
  onSubmit: (data: any) => void
  onDelete: (cartId: string) => void
}

export function QRScanner({ 
  onQRCodeDetected, 
  carts, 
  onSubmit, 
  onDelete 
}: QRScannerProps) {
  const [scannedQRCode, setScannedQRCode] = useState("")
  const { toast } = useToast()

  const { isScanning, setIsScanning, handleTestScan } = useQRScanner({
    onQRCodeDetected: (qrCode: string) => {
      setScannedQRCode(qrCode)
      
      // Check if QR code is valid format before passing it on
      if (qrCode.startsWith("CART-") || qrCode.startsWith("QR-")) {
        onQRCodeDetected(qrCode)
      } else {
        toast({
          title: "Invalid QR Code Format",
          description: "The QR code doesn't match the expected format for carts.",
          variant: "destructive"
        })
      }
    },
    carts,
    onSetExistingCart: () => {}
  })

  return (
    <QRScannerUI 
      isScanning={isScanning}
      onStartScan={() => setIsScanning(true)}
      onStopScan={() => setIsScanning(false)}
      onTestScan={handleTestScan}
    />
  )
}
