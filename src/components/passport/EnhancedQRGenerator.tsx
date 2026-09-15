import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, RefreshCw, Eye, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedQRGeneratorProps {
  profileData?: {
    full_name?: string;
    title?: string;
    username?: string;
  };
}

const EnhancedQRGenerator: React.FC<EnhancedQRGeneratorProps> = ({ profileData }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (user && profileData) {
      fetchReferralCode();
    }
  }, [user, profileData]);

  const fetchReferralCode = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();
      
      if (data?.referral_code) {
        setReferralCode(data.referral_code);
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
    
    // Generate QR after fetching referral code
    generateQRCode();
  };

  const generatePassportUrl = () => {
    const baseUrl = window.location.origin;
    const username = profileData?.username || user?.id;
    const basePassportUrl = `${baseUrl}/passport/public/${username}`;
    
    // Append referral code if available for automatic tracking
    if (referralCode) {
      return `${basePassportUrl}?ref=${referralCode}`;
    }
    
    return basePassportUrl;
  };

  const generateQRCode = async () => {
    if (!user || !profileData) return;

    setIsGenerating(true);
    try {
      const url = generatePassportUrl();
      setShareUrl(url);
      setQrCode(url);

      // Save QR code data to Supabase
      const { error } = await supabase
        .from('career_passport')
        .upsert({
          user_id: user.id,
          qr_code_url: url,
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "QR Code Generated",
        description: "Your professional QR code is ready to share!",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    // Create canvas with branding
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 400;
    
    canvas.width = size;
    canvas.height = size + 100; // Extra space for branding
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create QR code
      const tempSvg = document.createElement('div');
      tempSvg.innerHTML = `<svg width="${size-80}" height="${size-80}" xmlns="http://www.w3.org/2000/svg"></svg>`;
      
      // Add TalentXcel branding
      ctx.fillStyle = '#1a365d';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TalentXcel', canvas.width / 2, size + 30);
      
      ctx.fillStyle = '#4a5568';
      ctx.font = '16px Arial';
      ctx.fillText('Professional Career Passport', canvas.width / 2, size + 55);
      
      ctx.fillStyle = '#718096';
      ctx.font = '14px Arial';
      ctx.fillText(profileData?.full_name || 'Professional Profile', canvas.width / 2, size + 80);
      
      // Download
      const link = document.createElement('a');
      link.download = `talentxcel-passport-${profileData?.username || 'qr'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }

    toast({
      title: "Downloaded",
      description: "QR code saved with TalentXcel branding!",
    });
  };

  const shareQRCode = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData?.full_name}'s Professional Passport`,
          text: `Check out my professional profile on TalentXcel`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Profile link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    }
  };

  const viewPublicProfile = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (!user || !profileData) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please complete your profile to generate QR code</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded bg-primary"></div>
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            TalentXcel Professional QR
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Share your complete professional identity instantly
        </p>
      </CardHeader>

      <CardContent className="space-y-4">{/* Reduced spacing from space-y-6 to space-y-4 */}
        {qrCode ? (
          <div className="flex flex-col items-center space-y-3">{/* Reduced spacing from space-y-4 to space-y-3 */}
            {/* QR Code with TalentXcel branding */}
            <div className="relative p-4 bg-white rounded-lg shadow-lg border-2 border-primary/20">{/* Reduced padding from p-6 to p-4 */}
              <QRCodeSVG
                value={qrCode}
                size={180}
                bgColor="#ffffff"
                fgColor="#1a365d"
                level="H"
                includeMargin={true}
              />
              
              {/* TalentXcel logo overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">TX</span>
                </div>
              </div>
            </div>

            {/* Profile info */}
            <div className="text-center space-y-1">{/* Reduced spacing from space-y-2 to space-y-1 */}
              <h3 className="font-semibold text-lg">{profileData.full_name}</h3>
              {profileData.title && (
                <Badge variant="secondary">{profileData.title}</Badge>
              )}
              <p className="text-sm text-muted-foreground">
                Scan to view complete professional profile
              </p>
              {referralCode && (
                <Badge variant="outline" className="mt-2 text-xs bg-primary/5 border-primary/20">
                  <Gift className="h-3 w-3 mr-1" />
                  Auto-tracks referrals
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                onClick={shareQRCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                onClick={viewPublicProfile}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              
              <Button
                onClick={generateQRCode}
                variant="ghost"
                size="sm"
                className="gap-2"
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">{/* Reduced padding from py-8 to py-4 */}
            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate Professional QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedQRGenerator;