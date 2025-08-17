import React, { useState, useRef } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Download, Share2, Copy, Camera } from 'lucide-react';
import { toast } from 'sonner';

export const MobileQRScanner: React.FC = () => {
  const { user } = useAuth();
  const { careerPassport } = useCareerPassport();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, headline, current_company, email')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  const generateQRCode = async () => {
    if (!user || !profile) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.functions.supabase.co/functions/v1/qr-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData: {
            name: profile.full_name || 'Professional',
            title: profile.headline || 'Career Professional',
            company: profile.current_company || '',
            email: user.email,
          }
        }),
      });

      const data = await response.json();
      const url = data.qrCodeData || data.qrCodeDataUrl;
      if (url) {
        setQrCodeUrl(url);
        toast.success('QR Code generated successfully!');
      } else {
        throw new Error('Failed to generate QR code');
      }
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
    link.href = qrCodeUrl;
    link.download = `talentxcel-passport-${user?.id}.png`;
    link.click();
    toast.success('QR Code downloaded!');
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      if (navigator.share) {
        const file = new File([blob], 'career-passport-qr.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Career Passport QR Code',
          text: 'Connect with me on TalentXcel!',
          files: [file],
        });
      } else {
        // Fallback: copy link
        const passportUrl = `https://talentxcel.in/passport/${user?.id}`;
        await navigator.clipboard.writeText(passportUrl);
        toast.success('Passport link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share QR code');
    }
  };

  const copyPassportLink = async () => {
    const passportUrl = `https://talentxcel.in/passport/${user?.id}`;
    try {
      await navigator.clipboard.writeText(passportUrl);
      toast.success('Passport link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <MobileLayout>
      
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Career Passport QR</h1>
          <p className="text-gray-600 mt-2">
            Share your professional profile instantly at networking events
          </p>
        </div>

        {/* QR Code Display */}
        <Card className="mx-auto max-w-sm">
          <CardContent className="p-6 text-center">
            {qrCodeUrl ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
                  <img 
                    src={qrCodeUrl} 
                    alt="Career Passport QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                {profile && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">
                      {profile.full_name || 'Your Name'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {profile.headline || 'Professional Title'}
                    </p>
                    <div className="flex justify-center">
                      <Badge variant="secondary">
                        {careerPassport?.completion_percentage || 0}% Complete
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadQRCode}
                    className="flex flex-col h-auto py-3"
                  >
                    <Download className="h-4 w-4 mb-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={shareQRCode}
                    className="flex flex-col h-auto py-3"
                  >
                    <Share2 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Share</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPassportLink}
                    className="flex flex-col h-auto py-3"
                  >
                    <Copy className="h-4 w-4 mb-1" />
                    <span className="text-xs">Copy Link</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No QR code generated</p>
                  </div>
                </div>
                
                <Button
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Career QR Code'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Generate your unique career passport QR code</li>
                <li>• Share it at networking events and conferences</li>
                <li>• Others can scan to view your professional profile</li>
                <li>• Instantly connect and exchange information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">QR Scanner</h3>
              <p className="text-sm text-gray-600 mb-3">
                Scan other professionals' QR codes to connect instantly
              </p>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Open QR Scanner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </MobileLayout>
  );
};

export default MobileQRScanner;
