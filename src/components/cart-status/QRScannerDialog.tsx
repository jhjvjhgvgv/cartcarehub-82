
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRScanner } from "@/components/cart-form/QRScanner";
import { Cart } from "@/types/cart";

interface QRScannerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onQRCodeDetected: (qrCode: string) => void;
  carts: Cart[];
  onSubmit: (data: any) => void;
  onDelete: (cartId: string) => void;
}

export function QRScannerDialog({
  isOpen,
  onOpenChange,
  onQRCodeDetected,
  carts,
  onSubmit,
  onDelete
}: QRScannerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Cart QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <QRScanner 
            onQRCodeDetected={onQRCodeDetected}
            carts={carts}
            onSubmit={onSubmit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
