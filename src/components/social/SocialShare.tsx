import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link, 
  Copy, 
  Check,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  showTitle?: boolean;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = 'TalentXcel - AI-Powered Career Platform',
  description = 'Discover your dream job and advance your career with AI-powered tools',
  hashtags = ['TalentXcel', 'CareerGrowth', 'JobSearch', 'AI'],
  showTitle = true
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    hashtags: hashtags.map(tag => encodeURIComponent(tag)).join(',')
  };

  const socialShareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-black hover:text-white',
      shareUrl: `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}&hashtags=${shareData.hashtags}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700 hover:text-white',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-600 hover:text-white',
      shareUrl: `mailto:?subject=${shareData.title}&body=${shareData.description}%0A%0A${shareData.url}`
    }
  ];

  const handleShare = (platform: string, shareUrl: string) => {
    if (platform === 'Email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }

    // Track sharing events
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform.toLowerCase(),
        content_type: 'page',
        item_id: url
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The page URL has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Native Web Share API support
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Share This Page
          </CardTitle>
          <CardDescription>
            Spread the word about TalentXcel with your network
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {socialShareLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Button
                key={social.name}
                variant="outline"
                size="sm"
                className={`transition-colors ${social.color}`}
                onClick={() => handleShare(social.name, social.shareUrl)}
              >
                <Icon size={16} className="mr-2" />
                {social.name}
              </Button>
            );
          })}
        </div>

        {/* Copy Link Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check size={16} className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Copy Link
              </>
            )}
          </Button>

          {/* Native Share Button (if supported) */}
          {navigator.share && (
            <Button
              variant="outline"
              onClick={handleNativeShare}
            >
              <Share2 size={16} />
            </Button>
          )}
        </div>

        {/* URL Display */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded truncate">
          {url}
        </div>
      </CardContent>
    </Card>
  );
};