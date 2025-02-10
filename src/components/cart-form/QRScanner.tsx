
import { useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Camera, CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  onQRCodeDetected: (qrCode: string) => void
}

export function QRScanner({ onQRCodeDetected }: QRScannerProps) {
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
          hideSelectScanningRect: true,
        },
        /* verbose= */ false
      )

      scanner.render((decodedText) => {
        console.log("QR Code detected:", decodedText)
        onQRCodeDetected(decodedText)
        if (scanner) {
          scanner.clear()
          setIsScanning(false)
          toast({
            title: "QR Code Detected",
            description: `Successfully scanned QR code: ${decodedText}`,
          })
        }
      }, (err) => {
        // Only log significant errors, not regular scanning attempts
        if (!err.toString().includes("No QR code detected")) {
          console.error("QR Scanner error:", err)
        }
      })
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => {
          console.error("Error clearing scanner:", err)
        })
      }
    }
  }, [isScanning, onQRCodeDetected, toast])

  const handleTestScan = () => {
    const testCode = "Test QR Code Data"
    onQRCodeDetected(testCode)
    toast({
      title: "Test QR Code",
      description: `Successfully simulated scan: ${testCode}`,
    })
  }

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
  )
}
