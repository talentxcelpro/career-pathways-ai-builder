import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeShareSectionProps {
  userProfile?: any;
  insights: {
    career_readiness_score: number;
    market_competitiveness_score: number;
  };
  userId?: string;
}

export function QRCodeShareSection({ userProfile, insights, userId }: QRCodeShareSectionProps) {
  const [shareFormat, setShareFormat] = useState<'profile' | 'passport'>('passport');
  
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/profile/${userProfile?.username || userId}`;
  const passportUrl = `${baseUrl}/passport/${userProfile?.username || userId}`;
  
  const shareUrl = shareFormat === 'profile' ? profileUrl : passportUrl;
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userProfile?.full_name || 'TalentXcel'} - Career Passport`,
          text: `Check out my career readiness score: ${insights.career_readiness_score}% | Market competitiveness: ${insights.market_competitiveness_score}%`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('passport-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'career-passport-qr.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <Share2 className="w-5 h-5 mr-2" />
          Share Your Career Passport
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              <QRCodeSVG
                id="passport-qr-code"
                value={shareUrl}
                size={160}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#1f2937"
              />
            </div>
            
            <div className="flex gap-2 justify-center mb-3">
              <Badge 
                variant={shareFormat === 'passport' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setShareFormat('passport')}
              >
                Passport
              </Badge>
              <Badge 
                variant={shareFormat === 'profile' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setShareFormat('profile')}
              >
                Profile
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Quick Share</h4>
              <p className="text-sm text-gray-600 mb-4">
                Share your career achievements instantly with a QR code or direct link
              </p>
            </div>

            {/* Career Scores Display */}
            <div className="bg-white/60 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Career Readiness</span>
                <Badge className="bg-green-100 text-green-800">
                  {insights.career_readiness_score}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Market Competitiveness</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {insights.market_competitiveness_score}%
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Passport
              </Button>
              
              <Button variant="outline" onClick={handleCopyUrl} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open(shareUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}