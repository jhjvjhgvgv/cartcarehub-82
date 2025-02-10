
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
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.AZTEC,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            advanced: [{
              focusMode: "continuous",
              autoFocus: true
            } as MediaTrackConstraintSet]
          },
          defaultZoomValueIfSupported: 1
        },
        true
      )

      const success = (decodedText: string) => {
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
      }

      const error = (err: any) => {
        // Only log significant errors, not regular scanning attempts
        if (!err.toString().includes("No QR code detected")) {
          console.error("QR Scanner error:", err)
        }
      }

      scanner.render(success, error)

      // Add touch focus functionality
      const qrReader = document.getElementById('qr-reader')
      if (qrReader) {
        const video = qrReader.querySelector('video')
        if (video) {
          video.addEventListener('touchstart', async (e) => {
            e.preventDefault()
            try {
              const track = (video as any).srcObject?.getVideoTracks()[0]
              if (track && track.getCapabilities().focusMode) {
                await track.applyConstraints({
                  advanced: [{
                    focusMode: "manual"
                  }]
                })
                const rect = video.getBoundingClientRect()
                const x = (e.touches[0].clientX - rect.left) / rect.width
                const y = (e.touches[0].clientY - rect.top) / rect.height
                await track.applyConstraints({
                  advanced: [{
                    focusPoint: { x, y }
                  }]
                })
                toast({
                  title: "Focus Updated",
                  description: "Camera focus point updated",
                })
              }
            } catch (err) {
              console.error("Error setting focus point:", err)
            }
          })
        }
      }
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
    // Simulate a QR code detection with test data
    const testCode = "Test QR Code Data"
    onQRCodeDetected(testCode)
    toast({
      title: "Test QR Code",
      description: `Successfully simulated scan: ${testCode}`,
    })
  }

  return (
    <Card className="p-4">
      {!isScanning ? (
        <div className="space-y-2">
          <Button 
            type="button" 
            onClick={() => setIsScanning(true)}
            className="w-full"
          >
            Scan QR Code
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleTestScan}
            className="w-full"
          >
            Test Scanner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full max-w-[400px] mx-auto touch-none" />
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
