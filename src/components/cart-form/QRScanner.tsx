
import { useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Camera, CheckCircle2 } from "lucide-react"
import { CartDialog } from "@/components/carts/CartDialog"
import { useCarts } from "@/hooks/use-carts"
import { Cart } from "@/types/cart"

interface QRScannerProps {
  onQRCodeDetected: (qrCode: string) => void
}

export function QRScanner({ onQRCodeDetected }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false)
  const [scannedQRCode, setScannedQRCode] = useState("")
  const [existingCart, setExistingCart] = useState<Cart | null>(null)
  const { toast } = useToast()
  const { carts, handleSubmit: handleCartSubmit, handleDeleteCart } = useCarts([])
  
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

      const onScanSuccess = (decodedText: string) => {
        console.log("QR Code detected:", decodedText)
        setScannedQRCode(decodedText)
        
        // Find if cart already exists - now using strict equality
        const foundCart = carts.find(cart => cart.rfidTag === decodedText)
        setExistingCart(foundCart || null)
        
        if (scanner) {
          scanner.clear()
          setIsScanning(false)
          setIsCartDialogOpen(true)
          
          if (foundCart) {
            toast({
              title: "Existing Cart Found",
              description: `Found cart: ${foundCart.id} at ${foundCart.store}`,
            })
          } else {
            toast({
              title: "New Cart",
              description: "No existing cart found with this QR code. Creating new cart.",
            })
          }
        }
        
        onQRCodeDetected(decodedText)
      }

      const onScanError = (err: any) => {
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
  }, [isScanning, onQRCodeDetected, toast, carts])

  const handleTestScan = () => {
    const testCode = "QR-123456789" // Using one of the existing cart QR codes
    setScannedQRCode(testCode)
    
    // Check for existing cart with test QR code
    const foundCart = carts.find(cart => cart.rfidTag === testCode)
    setExistingCart(foundCart || null)
    
    if (foundCart) {
      toast({
        title: "Existing Cart Found",
        description: `Found cart: ${foundCart.id} at ${foundCart.store}`,
      })
    } else {
      toast({
        title: "New Cart",
        description: "No existing cart found with this QR code. Creating new cart.",
      })
    }
    
    onQRCodeDetected(testCode)
    setIsCartDialogOpen(true)
  }

  const handleSubmit = (data: any) => {
    if (existingCart) {
      // Updating existing cart
      handleCartSubmit(data, existingCart, [
        { id: "store1", name: "SuperMart Downtown" },
        { id: "store2", name: "FreshMart Heights" },
        { id: "store3", name: "Value Grocery West" },
      ])
      toast({
        title: "Success",
        description: "Cart details have been updated.",
      })
    } else {
      // Creating new cart
      handleCartSubmit(data, null, [
        { id: "store1", name: "SuperMart Downtown" },
        { id: "store2", name: "FreshMart Heights" },
        { id: "store3", name: "Value Grocery West" },
      ])
      toast({
        title: "Success",
        description: "New cart has been created.",
      })
    }
    setIsCartDialogOpen(false)
  }

  const handleDelete = (cartId: string) => {
    handleDeleteCart(cartId)
    setIsCartDialogOpen(false)
    toast({
      title: "Cart Deleted",
      description: "Cart has been removed from the system.",
      variant: "destructive",
    })
  }

  return (
    <>
      <Card className="p-6 space-y-4">
        {!isScanning ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <Camera className="w-12 h-12 mx-auto text-primary opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-1">QR Code Scanner</h3>
              <p className="text-sm text-muted-foreground">
                Scan a cart's QR code to view its details
              </p>
            </div>
            <Button 
              type="button" 
              onClick={() => setIsScanning(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Scanning
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleTestScan}
              className="w-full flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Test Scanner
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div id="qr-reader" className="w-full max-w-[300px] mx-auto rounded-lg overflow-hidden" />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsScanning(false)}
              className="w-full"
            >
              Cancel Scanning
            </Button>
          </div>
        )}
      </Card>

      <CartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
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
