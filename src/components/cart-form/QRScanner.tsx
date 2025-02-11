
import { useState } from "react"
import { Cart } from "@/types/cart"
import { QRScannerUI } from "../qr-scanner/QRScannerUI"
import { useQRScanner } from "../qr-scanner/useQRScanner"
import { CartDialog } from "@/components/carts/CartDialog"

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
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false)
  const [scannedQRCode, setScannedQRCode] = useState("")
  const [existingCart, setExistingCart] = useState<Cart | null>(null)

  const { isScanning, setIsScanning, handleTestScan } = useQRScanner({
    onQRCodeDetected: (qrCode: string) => {
      setScannedQRCode(qrCode)
      setIsCartDialogOpen(true)
      onQRCodeDetected(qrCode)
    },
    carts,
    onSetExistingCart: setExistingCart
  })

  return (
    <>
      <QRScannerUI 
        isScanning={isScanning}
        onStartScan={() => setIsScanning(true)}
        onStopScan={() => setIsScanning(false)}
        onTestScan={handleTestScan}
      />

      <CartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        onSubmit={onSubmit}
        onDelete={onDelete}
        editingCart={existingCart || {
          id: "new",
          rfidTag: scannedQRCode,
          store: "",
          storeId: "",
          status: "active",
          lastMaintenance: new Date().toISOString().split("T")[0],
          issues: [],
        }}
        managedStores={[
          { id: "store1", name: "SuperMart Downtown" },
          { id: "store2", name: "FreshMart Heights" },
          { id: "store3", name: "Value Grocery West" },
        ]}
      />
    </>
  )
}
