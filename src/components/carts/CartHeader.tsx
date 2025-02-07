
import { Button } from "@/components/ui/button"
import { PlusCircle, ScanLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { QRScanner } from "@/components/cart-form/QRScanner"
import { useToast } from "@/hooks/use-toast"

interface CartHeaderProps {
  onAddClick: () => void
}

export function CartHeader({ onAddClick }: CartHeaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleQRCodeDetected = (qrCode: string) => {
    toast({
      title: "QR Code Detected",
      description: `QR Code value: ${qrCode}`,
    });
    setIsScanning(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white" 
            onClick={() => setIsScanning(true)}
          >
            <ScanLine className="h-4 w-4" />
            Scan QR Code
          </Button>
          <Button className="flex items-center gap-2" onClick={onAddClick}>
            <PlusCircle className="h-4 w-4" />
            Add New Cart
          </Button>
        </div>
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Cart QR Code</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <QRScanner onQRCodeDetected={handleQRCodeDetected} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

