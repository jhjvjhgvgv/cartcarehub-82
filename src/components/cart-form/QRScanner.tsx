
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
      const existingCart = carts.find(cart => cart.rfidTag === qrCode)
      
      if (existingCart) {
        toast({
          title: "Cart Found",
          description: `Found cart: ${existingCart.id}`,
        })
      } else {
        toast({
          title: "Cart Not Found",
          description: "This cart is not registered in the system.",
          variant: "destructive"
        })
      }
      
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
