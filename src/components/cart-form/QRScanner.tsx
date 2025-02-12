
import { useState } from "react"
import { Cart } from "@/types/cart"
import { QRScannerUI } from "../qr-scanner/QRScannerUI"
import { useQRScanner } from "../qr-scanner/useQRScanner"
import { CartDialog } from "@/components/carts/CartDialog"
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
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false)
  const [scannedQRCode, setScannedQRCode] = useState("")
  const [existingCart, setExistingCart] = useState<Cart | null>(null)
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
        setIsCartDialogOpen(true)
      }
      
      onQRCodeDetected(qrCode)
    },
    carts,
    onSetExistingCart: setExistingCart
  })

  const handleSubmit = (data: any) => {
    onSubmit(data)
    setIsCartDialogOpen(false)
    toast({
      title: "Success",
      description: "New cart has been created.",
    })
  }

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
        onSubmit={handleSubmit}
        onDelete={(cartId) => {
          onDelete(cartId)
          setIsCartDialogOpen(false)
        }}
        editingCart={{
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
