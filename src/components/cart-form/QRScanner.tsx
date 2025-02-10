
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
            facingMode: { exact: "environment" },
            width: { min: 640, ideal: 1080, max: 1920 },
            height: { min: 480, ideal: 1080, max: 1080 },
            advanced: [{
              focusMode: "continuous",
              autoFocus: true
            } as MediaTrackConstraintSet]
          }
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

      // Add touch focus functionality with visual feedback
      setTimeout(() => {
        const qrReader = document.getElementById('qr-reader')
        if (qrReader) {
          const video = qrReader.querySelector('video')
          if (video) {
            // Add focus point indicator
            const focusPoint = document.createElement('div')
            focusPoint.className = 'focus-point'
            focusPoint.style.cssText = `
              position: absolute;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid #fff;
              display: none;
              pointer-events: none;
              transform: translate(-50%, -50%);
              box-shadow: 0 0 0 2px rgba(0,0,0,0.5);
              z-index: 1000;
            `
            qrReader.style.position = 'relative'
            qrReader.appendChild(focusPoint)

            // Add tap to focus instruction
            const instruction = document.createElement('div')
            instruction.className = 'focus-instruction'
            instruction.textContent = 'Tap to focus'
            instruction.style.cssText = `
              position: absolute;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              z-index: 1000;
            `
            qrReader.appendChild(instruction)

            video.addEventListener('touchstart', async (e) => {
              e.preventDefault()
              try {
                const track = (video as any).srcObject?.getVideoTracks()[0]
                if (track && track.getCapabilities().focusMode) {
                  // Show focus point animation
                  const rect = video.getBoundingClientRect()
                  const x = e.touches[0].clientX - rect.left
                  const y = e.touches[0].clientY - rect.top
                  
                  focusPoint.style.display = 'block'
                  focusPoint.style.left = `${x}px`
                  focusPoint.style.top = `${y}px`
                  focusPoint.style.animation = 'focus-pulse 0.5s ease-out'
                  
                  await track.applyConstraints({
                    advanced: [{
                      focusMode: "manual"
                    }]
                  })

                  await track.applyConstraints({
                    advanced: [{
                      focusPoint: { 
                        x: x / rect.width,
                        y: y / rect.height 
                      }
                    }]
                  })

                  toast({
                    title: "Focus Updated",
                    description: "Camera focus point updated",
                  })

                  // Hide focus point after animation
                  setTimeout(() => {
                    focusPoint.style.display = 'none'
                  }, 500)
                }
              } catch (err) {
                console.error("Error setting focus point:", err)
                toast({
                  title: "Focus Error",
                  description: "Could not update camera focus",
                  variant: "destructive"
                })
              }
            })
          }
        }
      }, 1000) // Give time for the scanner to initialize
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
          <style>{`
            @keyframes focus-pulse {
              0% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            }
            #qr-reader {
              touch-action: none;
              position: relative;
              background: black;
              border-radius: 8px;
              overflow: hidden;
            }
            #qr-reader video {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          `}</style>
          <div id="qr-reader" className="w-full max-w-[400px] mx-auto" />
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
