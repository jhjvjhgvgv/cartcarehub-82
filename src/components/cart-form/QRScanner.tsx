
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
      const cartExists = carts.some(cart => cart.rfidTag === qrCode)
      
      if (cartExists) {
        toast({
          title: "Cart Found",
          description: "This cart is already registered in the system.",
        })
      } else {
        onSubmit({
          id: "new",
          rfidTag: qrCode,
          store: "",
          storeId: "",
          status: "active",
          lastMaintenance: new Date().toISOString().split("T")[0],
          issues: [],
        })
      }
      
      onQRCodeDetected(qrCode)
    },
    carts,
    onSetExistingCart: () => {} // We don't need this anymore since we're not showing the dialog
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
