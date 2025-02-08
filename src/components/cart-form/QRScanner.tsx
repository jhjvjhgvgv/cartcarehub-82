
import { useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from "html5-qrcode"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

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
          fps: 15, 
          qrbox: { width: 150, height: 150 }, // Reduced scanner size
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          disableFlip: false,
          videoConstraints: {
            frameRate: { ideal: 30, min: 15 },
            facingMode: "environment"
          }
        },
        false
      )

      const success = (decodedText: string) => {
        console.log("QR Code detected:", decodedText)
        onQRCodeDetected(decodedText)
        if (scanner) {
          scanner.clear()
          setIsScanning(false)
          toast({
            title: "QR Code Detected",
            description: "Successfully scanned QR code.",
          })
        }
      }

      const error = (err: any) => {
        console.error("QR Scanner error:", err)
      }

      scanner.render(success, error)
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => {
          console.error("Error clearing scanner:", err)
        })
      }
    }
  }, [isScanning, onQRCodeDetected, toast])

  return (
    <Card className="p-4">
      {!isScanning ? (
        <Button 
          type="button" 
          onClick={() => setIsScanning(true)}
          className="w-full"
        >
          Scan QR Code
        </Button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full max-w-[250px] mx-auto" />
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
