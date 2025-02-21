
import { Button } from "@/components/ui/button"
import { PlusCircle, ScanLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { QRScanner } from "@/components/cart-form/QRScanner"
import { useToast } from "@/hooks/use-toast"
import { useCarts } from "@/hooks/use-carts"
import { CartForm } from "@/components/cart-form"
import { Cart } from "@/types/cart"

interface CartHeaderProps {
  onAddClick: () => void
}

export function CartHeader({ onAddClick }: CartHeaderProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isAddingCart, setIsAddingCart] = useState(false)
  const [newCartRfid, setNewCartRfid] = useState("")
  const { toast } = useToast()
  const { carts, handleSubmit } = useCarts()

  const handleQRCodeDetected = (qrCode: string) => {
    const existingCart = carts.find(cart => cart.rfidTag === qrCode)
    
    if (existingCart) {
      toast({
        title: "Cart Found",
        description: `Found cart: ${existingCart.id}`,
      })
    }
  }

  const handleAddCartSubmit = (data: any) => {
    handleSubmit({
      data,
      editingCart: null,
      managedStores: [
        { id: "store1", name: "SuperMart Downtown" },
        { id: "store2", name: "FreshMart Heights" },
        { id: "store3", name: "Value Grocery West" },
      ]
    })
    setIsAddingCart(false)
    setNewCartRfid("")
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2 min-w-[140px] bg-purple-500 hover:bg-purple-600 text-white" 
            onClick={() => setIsScanning(true)}
          >
            <ScanLine className="h-4 w-4" />
            Find Cart
          </Button>
          <Button 
            className="flex items-center gap-2 min-w-[140px]" 
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
            <QRScanner onQRCodeDetected={handleQRCodeDetected} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
