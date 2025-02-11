
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, CheckCircle2 } from "lucide-react"

interface QRScannerUIProps {
  isScanning: boolean
  onStartScan: () => void
  onStopScan: () => void
  onTestScan: () => void
}

export function QRScannerUI({ 
  isScanning, 
  onStartScan, 
  onStopScan, 
  onTestScan 
}: QRScannerUIProps) {
  return (
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
            onClick={onStartScan}
            className="w-full flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Start Scanning
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={onTestScan}
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
            onClick={onStopScan}
            className="w-full"
          >
            Cancel Scanning
          </Button>
        </div>
      )}
    </Card>
  )
}
