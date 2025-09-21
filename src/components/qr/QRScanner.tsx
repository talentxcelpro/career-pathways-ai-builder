import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Scan, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QRScannerProps {
  onScan?: (result: string) => void;
  className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedUrl, setLastScannedUrl] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      // Check if camera is supported
      if (!QrScanner.hasCamera()) {
        toast({
          title: "Camera Not Available",
          description: "Your device doesn't have a camera or it's not supported",
          variant: "destructive"
        });
        return;
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera if available
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
      setHasPermission(true);

      toast({
        title: "Scanner Ready",
        description: "Point your camera at a QR code to scan"
      });
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (result: string) => {
    console.log('QR Code scanned:', result);
    setLastScannedUrl(result);

    // Stop scanning after successful scan
    stopScanning();

    // Check if it's a TalentXcel profile URL
    if (result.includes('talentxcel') || result.includes('passport')) {
      toast({
        title: "Profile Detected!",
        description: "Career profile found. Opening...",
      });
      
      // Extract relative path if it's a full URL
      try {
        const url = new URL(result);
        navigate(url.pathname);
      } catch {
        // If not a valid URL, assume it's a relative path
        navigate(result);
      }
    } else {
      toast({
        title: "QR Code Scanned",
        description: "This doesn't appear to be a career profile",
      });
    }

    // Call the onScan callback if provided
    onScan?.(result);
  };

  const visitScannedUrl = () => {
    if (lastScannedUrl) {
      if (lastScannedUrl.startsWith('http')) {
        window.open(lastScannedUrl, '_blank');
      } else {
        navigate(lastScannedUrl);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Scan className="h-5 w-5 text-primary" />
          QR Code Scanner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan career profiles and connect instantly
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          {isScanning ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg border-dashed opacity-75"></div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Camera className="h-12 w-12 mb-4" />
              <p className="text-sm text-center">
                {hasPermission === false 
                  ? "Camera access required"
                  : "Camera ready to scan"
                }
              </p>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="flex-1 flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Start Scanning
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="flex-1 flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Last Scanned Result */}
        {lastScannedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Last Scanned:</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={visitScannedUrl}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Visit
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {lastScannedUrl}
            </p>
          </motion.div>
        )}

        {/* Tips */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="text-sm font-medium mb-2 text-primary">Scanning Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Hold phone steady and ensure good lighting</li>
            <li>• Keep QR code within the frame</li>
            <li>• Works best at arm's length distance</li>
            <li>• Scanned profiles open automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};