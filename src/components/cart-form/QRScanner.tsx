
import { useState } from "react"
import { Cart } from "@/types/cart"
import { QRScannerUI } from "../qr-scanner/QRScannerUI"
import { useQRScanner } from "../qr-scanner/useQRScanner"
import { useToast } from "@/hooks/use-toast"

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
      onQRCodeDetected(qrCode)
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
