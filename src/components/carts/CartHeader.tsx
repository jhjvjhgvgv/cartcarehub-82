
import { Button } from "@/components/ui/button"
import { PlusCircle, ScanLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { QRScanner } from "@/components/cart-form/QRScanner"
import { useToast } from "@/hooks/use-toast"
import { useCarts } from "@/hooks/use-carts"
import { Cart } from "@/types/cart"
import { useNavigate } from "react-router-dom"

interface CartHeaderProps {
  onAddClick: () => void
}

export function CartHeader({ onAddClick }: CartHeaderProps) {
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const { carts, handleSubmit, handleDeleteCart } = useCarts()
  const navigate = useNavigate()

  const handleQRCodeDetected = (qrCode: string) => {
    const existingCart = carts.find(cart => cart.qr_code === qrCode)
    
    if (existingCart) {
      toast({
        title: "Cart Found",
        description: `Found cart: ${existingCart.qr_code}`,
      })
      // Navigate to the cart details page
      navigate(`/carts/${existingCart.id}`)
      setIsScanning(false)
    } else {
      toast({
        title: "Cart Not Found",
        description: "No cart found with this QR code. You can add it as a new cart.",
        // Fixed the variant type error by using a valid variant
        variant: "destructive"
      })
      // Close the scanner dialog
      setIsScanning(false)
      // Open the add cart dialog with the scanned QR code pre-filled
      onAddClick()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
        <div className="flex gap-3">
          <Button 
            className="flex items-center gap-2 min-w-[140px] bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5" 
            onClick={() => setIsScanning(true)}
          >
            <ScanLine className="h-4 w-4" />
            Find Cart
          </Button>
          <Button 
            className="flex items-center gap-2 min-w-[140px] px-5 py-2.5" 
            onClick={onAddClick}
          >
            <PlusCircle className="h-4 w-4" />
            Add New Cart
          </Button>
        </div>
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Find Cart by QR Code</DialogTitle>
            <DialogDescription>
              Scan a QR code to find an existing cart
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <QRScanner 
              onQRCodeDetected={handleQRCodeDetected}
              carts={carts}
              onSubmit={handleSubmit}
              onDelete={handleDeleteCart}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
