import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface QRCodeGeneratorProps {
  profileUrl: string;
  profileName: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  profileUrl,
  profileName,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [profileUrl]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      // Also generate data URL for downloading
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Copied!",
        description: "Profile URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${profileName.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "QR code saved to your device"
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s Career Profile`,
          text: `Check out ${profileName}'s professional career profile`,
          url: profileUrl
        });
      } catch (error) {
        // User cancelled sharing or share failed
        handleCopyUrl();
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center justify-center gap-2 text-base sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          QR Code
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Scan to view profile instantly
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 px-3 sm:px-6 pb-4">
        {/* QR Code Display - Optimized for mobile */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="p-2 sm:p-3 bg-white rounded-lg shadow-md border border-primary/20">
            <canvas ref={canvasRef} className="block max-w-full" style={{ width: '160px', height: '160px' }} />
          </div>
        </motion.div>

        {/* Profile Info - Compact */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-sm text-foreground truncate">{profileName}</h3>
          <p className="text-xs text-muted-foreground font-mono truncate px-2">
            {profileUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>

        {/* Action Buttons - Mobile optimized */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs border-primary/20 hover:bg-primary/5"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs border-primary/20 hover:bg-primary/5"
            >
              <Download className="h-3 w-3" />
              <span>Save</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs border-primary/20 hover:bg-primary/5"
            >
              <Share2 className="h-3 w-3" />
              <span>Share</span>
            </Button>
          </motion.div>
        </div>

        {/* Usage Tips - Compact */}
        <div className="p-2 sm:p-3 bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg border border-muted">
          <h4 className="text-xs font-semibold mb-1.5 text-foreground">Pro Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Works offline</li>
            <li>• Perfect for networking</li>
            <li>• Print on business cards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};