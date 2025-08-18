import React, { useState, useRef, useEffect } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Download, Share2, Copy, Camera, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';
import QRCode from 'qrcode';

export const MobileQRScanner: React.FC = () => {
  const { user } = useAuth();
  const { careerPassport } = useCareerPassport();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

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
      const { data, error } = await supabase.functions.invoke('qr-generator', {
        body: {
          userId: user.id
        }
      });

      if (error) throw error;

      let url: string | null = null;
      if (data?.qrCodeData) {
        url = data.qrCodeData;
      } else if (data?.publicUrl) {
        // Generate client-side QR if function returned URL only
        url = await QRCode.toDataURL(data.publicUrl, { width: 320, margin: 2 });
      } else if (data?.success) {
        // Final fallback to deterministic public URL
        const publicUrl = `https://talentxcel.in/passport/${encodeURIComponent(user.id)}`;
        url = await QRCode.toDataURL(publicUrl, { width: 320, margin: 2 });
      }

      if (url) {
        setQrCodeUrl(url);
        toast.success('QR Code generated successfully!');
      } else {
        throw new Error('No QR code data returned');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      try {
        const publicUrl = `https://talentxcel.in/passport/${encodeURIComponent(user.id)}`;
        const fallbackDataUrl = await QRCode.toDataURL(publicUrl, { width: 320, margin: 2 });
        setQrCodeUrl(fallbackDataUrl);
        toast.success('QR Code generated (client fallback)');
      } catch (clientErr) {
        console.error('Client QR fallback failed:', clientErr);
        toast.error('Failed to generate QR code');
      }
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

  const startQRScanning = () => {
    // Trigger UI to render the video element first
    setScannedResult('');
    setIsScanning(true);
  };

  const stopQRScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScannedResult = (result: string) => {
    console.log('Scanned QR code:', result);
    
    // Check if it's a TalentXcel profile link
    if (result.includes('talentxcel.in/passport/') || result.includes('passport')) {
      const userId = result.split('/').pop();
      if (userId && userId !== user?.id) {
        // Navigate to the scanned user's profile
        window.location.href = `/passport/${userId}`;
        toast.success('Opening career passport...');
      } else if (userId === user?.id) {
        toast.info('This is your own QR code!');
      }
    } else if (result.startsWith('http')) {
      // Generic URL
      const confirmOpen = window.confirm(`Open this link?\n${result}`);
      if (confirmOpen) {
        window.open(result, '_blank');
      }
    } else {
      // Show the raw result
      toast.success(`QR Code scanned: ${result}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopQRScanning();
    };
  }, []);

  // Initialize scanner after the video element is mounted
  useEffect(() => {
    const init = async () => {
      if (!isScanning) return;
      if (!window.isSecureContext) {
        toast.error('Camera requires HTTPS. Please use https://talentxcel.in');
        setIsScanning(false);
        return;
      }
      if (!videoRef.current || qrScannerRef.current) return; // wait for ref or avoid duplicate
      try {
        const hasCam = await QrScanner.hasCamera();
        if (!hasCam) {
          toast.error('No camera found on device.');
          setIsScanning(false);
          return;
        }
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            setScannedResult(result.data);
            stopQRScanning();
            handleScannedResult(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
          }
        );
        await qrScannerRef.current.start();
        toast.success('QR Scanner started! Point camera at a QR code');
      } catch (err) {
        console.error('QR init error:', err);
        toast.error('Failed to start camera. Please check permissions.');
        setIsScanning(false);
      }
    };
    init();
  }, [isScanning]);

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
              
              {/* Scanner Interface */}
              {isScanning && (
                <div className="mb-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={stopQRScanning}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Point your camera at a QR code to scan
                  </p>
                </div>
              )}

              {/* Scanned Result */}
              {scannedResult && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">QR Code Scanned!</span>
                  </div>
                  <p className="text-sm text-green-700 break-all">{scannedResult}</p>
                </div>
              )}

              <Button 
                variant={isScanning ? "destructive" : "default"} 
                className="w-full"
                onClick={isScanning ? stopQRScanning : startQRScanning}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? 'Stop Scanner' : 'Open QR Scanner'}
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
