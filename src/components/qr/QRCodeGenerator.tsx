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
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-primary" />
          Career QR Code
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your profile instantly with a scan
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <canvas ref={canvasRef} className="block" />
          </div>
        </motion.div>

        {/* Profile Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-foreground">{profileName}</h3>
          <p className="text-xs text-muted-foreground font-mono break-all">
            {profileUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Copy className="h-4 w-4" />
            <span className="text-xs">Copy URL</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs">Download</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>

        {/* Usage Tips */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Quick Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Works offline once scanned</li>
            <li>• Perfect for networking events</li>
            <li>• Print on business cards</li>
            <li>• Share via social media</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};