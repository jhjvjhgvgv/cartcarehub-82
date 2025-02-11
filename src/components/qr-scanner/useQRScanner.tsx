
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

      const onScanSuccess = (decodedText: string) => {
        console.log("QR Code detected:", decodedText)
        
        // Find if cart already exists
        const foundCart = carts.find(cart => cart.rfidTag === decodedText)
        console.log("Found cart:", foundCart)
        onSetExistingCart(foundCart || null)
        
        if (scanner) {
          scanner.clear()
          setIsScanning(false)
          
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
  }, [isScanning, onQRCodeDetected, toast, carts, onSetExistingCart])

  const handleTestScan = () => {
    const testCode = "QR-123456789"
    
    // Check for existing cart with test QR code
    const foundCart = carts.find(cart => cart.rfidTag === testCode)
    console.log("Test scan found cart:", foundCart)
    onSetExistingCart(foundCart || null)
    
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
  }

  return {
    isScanning,
    setIsScanning,
    handleTestScan
  }
}
