import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  profileData?: {
    full_name?: string;
    title?: string;
    username?: string;
  };
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ profileData }) => {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [passportUrl, setPassportUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrData, setQrData] = useState<any>(null);

  useEffect(() => {
    if (user && profileData) {
      generateQRCode();
    }
  }, [user, profileData]);

  const generatePassportUrl = () => {
    const baseUrl = window.location.origin;
    const username = profileData?.username || user?.id;
    return `${baseUrl}/passport/${username}`;
  };

  const generateQRCode = async () => {
    if (!user || !profileData) return;

    setIsGenerating(true);
    try {
      const url = generatePassportUrl();
      setPassportUrl(url);

      // Generate QR code data
      const qrCodeData = JSON.stringify({
        type: 'career_passport',
        userId: user.id,
        name: profileData.full_name || 'Professional User',
        title: profileData.title || '',
        url: url,
        timestamp: new Date().toISOString()
      });

      // Generate QR code image
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);

      // Save to database
      const { data, error } = await supabase
        .from('career_passport_qr')
        .upsert({
          user_id: user.id,
          qr_code_data: qrCodeData,
          qr_code_url: qrCodeDataUrl,
          passport_url: url,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setQrData(data);

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${profileData?.full_name || 'career'}-passport-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const shareQRCode = async () => {
    if (!passportUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileData?.full_name || 'Professional'}'s Career Passport`,
          text: `Check out my career passport on TalentXcel`,
          url: passportUrl
        });
      } else {
        await navigator.clipboard.writeText(passportUrl);
        toast.success('Passport URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  if (!user || !profileData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Complete your profile to generate QR code</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Digital Passport QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl ? (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img 
                src={qrCodeUrl} 
                alt="Career Passport QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Scan to view career passport instantly
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareQRCode}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-muted rounded-lg">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Generate your digital passport QR code</p>
              <Button 
                onClick={generateQRCode} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                Generate QR Code
              </Button>
            </div>
          </div>
        )}

        {qrData && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              QR Code updated {new Date(qrData.generated_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};