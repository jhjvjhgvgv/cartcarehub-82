import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRScanner } from "@/components/cart-form/QRScanner";
import { Cart } from "@/types/cart";

interface QRScannerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onQRCodeDetected?: (qrCode: string) => void;
  carts: Cart[];
  onSubmit: (data: any) => void;
  onDelete: (cartId: string) => void;
  /** When true (default), a successful scan routes to /inspection?qr=... */
  routeToInspection?: boolean;
}

export function QRScannerDialog({
  isOpen,
  onOpenChange,
  onQRCodeDetected,
  carts,
  onSubmit,
  onDelete,
  routeToInspection = true,
}: QRScannerDialogProps) {
  const navigate = useNavigate();

  const handleDetected = (qrCode: string) => {
    onQRCodeDetected?.(qrCode);
    if (routeToInspection && qrCode) {
      onOpenChange(false);
      navigate(`/inspection?qr=${encodeURIComponent(qrCode)}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Cart QR Code</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <QRScanner
            onQRCodeDetected={handleDetected}
            carts={carts}
            onSubmit={onSubmit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
