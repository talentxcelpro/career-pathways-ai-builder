import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  resumeUrl?: string;
  onGenerate?: (qrCodeUrl: string) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  resumeUrl,
  onGenerate
}) => {
  const [customUrl, setCustomUrl] = useState(resumeUrl || '');
  const [qrSize, setQrSize] = useState(256);
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = () => {
    if (!customUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    setShowQR(true);
    if (onGenerate) {
      onGenerate(customUrl);
    }
  };

  const downloadQR = () => {
    // For SVG, we'll use a different approach to download
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'resume-qr-code.png';
        link.href = url;
        link.click();
        toast.success('QR code downloaded successfully!');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Resume URL</Label>
          <Input
            id="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://your-resume-url.com"
            type="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">QR Code Size</Label>
          <Input
            id="size"
            type="number"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            min="128"
            max="512"
            step="32"
          />
        </div>

        <Button onClick={handleGenerate} className="w-full">
          Generate QR Code
        </Button>

        {showQR && customUrl && (
          <div className="text-center space-y-4">
            <div className="flex justify-center p-4 bg-background border rounded-lg">
              <QRCodeSVG
                value={customUrl}
                size={qrSize}
                level="M"
                includeMargin={true}
              />
            </div>
            <Button 
              onClick={downloadQR} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};