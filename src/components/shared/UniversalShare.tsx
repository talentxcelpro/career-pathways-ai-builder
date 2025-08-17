
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link, 
  Copy, 
  Check,
  Mail,
  MessageCircle,
  Camera,
  Send,
  Instagram,
  Youtube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ShareableContent {
  id: string;
  type: 'post' | 'job' | 'company' | 'college' | 'article' | 'profile';
  title: string;
  description?: string;
  url?: string;
  image?: string;
  author?: string;
  location?: string;
  salary?: string;
  company?: string;
  hashtags?: string[];
  customMessage?: string;
}

interface UniversalShareProps {
  content: ShareableContent;
  showTitle?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  onShareComplete?: (platform: string) => void;
}

export const UniversalShare: React.FC<UniversalShareProps> = ({
  content,
  showTitle = true,
  variant = 'default',
  onShareComplete
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    
    // Always generate application page URL instead of using direct content URL
    // This prevents sharing raw Supabase storage URLs for media content
    const pathMap = {
      post: `/network/posts/${content.id}`,
      job: `/jobs/${content.id}`,
      company: `/companies/${content.id}`,
      college: `/colleges/${content.id}`,
      article: `/network/articles/${content.id}`,
      profile: `/network/people/${content.id}`
    };
    
    return `${baseUrl}${pathMap[content.type]}`;
  };

  const generateShareMessage = (platform: string) => {
    const url = generateShareUrl();
    const hashtags = content.hashtags || [];
    
    const messages = {
      post: {
        title: content.title,
        description: content.description || 'Check out this post from TalentXcel',
        hashtags: ['TalentXcel', 'Networking', 'Career', ...hashtags]
      },
      job: {
        title: `${content.title} at ${content.company || 'Company'}`,
        description: `Great job opportunity: ${content.title}${content.location ? ` in ${content.location}` : ''}${content.salary ? ` - ${content.salary}` : ''}`,
        hashtags: ['Jobs', 'Career', 'Hiring', 'TalentXcel', ...hashtags]
      },
      company: {
        title: `${content.title} - Company Profile`,
        description: `Learn about ${content.title} and explore career opportunities`,
        hashtags: ['Company', 'Career', 'Business', 'TalentXcel', ...hashtags]
      },
      college: {
        title: `${content.title} - College Information`,
        description: `Discover ${content.title}${content.location ? ` in ${content.location}` : ''} and their programs`,
        hashtags: ['Education', 'College', 'Career', 'TalentXcel', ...hashtags]
      },
      article: {
        title: content.title,
        description: content.description || `Insightful article by ${content.author || 'TalentXcel'}`,
        hashtags: ['Article', 'Career', 'Professional', 'TalentXcel', ...hashtags]
      },
      profile: {
        title: `${content.title} - Professional Profile`,
        description: `Connect with ${content.title} on TalentXcel`,
        hashtags: ['Professional', 'Networking', 'Career', 'TalentXcel', ...hashtags]
      }
    };

    const messageData = messages[content.type];
    
    const platformSpecificFormatting = {
      whatsapp: `*${messageData.title}*\n\n${messageData.description}\n\n${url}`,
      telegram: `**${messageData.title}**\n\n${messageData.description}\n\n${url}\n\n${messageData.hashtags.map(tag => `#${tag}`).join(' ')}`,
      facebook: `${messageData.title}\n\n${messageData.description}`,
      twitter: `${messageData.title}\n\n${messageData.hashtags.map(tag => `#${tag}`).join(' ')}`,
      linkedin: `${messageData.title}\n\n${messageData.description}`,
      email: `Subject: ${messageData.title}\n\nBody: ${messageData.description}\n\n${url}`,
      instagram: `${messageData.title}\n\n${messageData.hashtags.map(tag => `#${tag}`).join(' ')}`,
      default: `${messageData.title}\n\n${messageData.description}\n\n${url}`
    };

    return {
      message: platformSpecificFormatting[platform as keyof typeof platformSpecificFormatting] || platformSpecificFormatting.default,
      hashtags: messageData.hashtags,
      url
    };
  };

  const shareData = generateShareMessage('default');

  const socialShareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-600 hover:text-white',
      shareUrl: `https://wa.me/?text=${encodeURIComponent(generateShareMessage('whatsapp').message)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'hover:bg-blue-500 hover:text-white',
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(generateShareMessage('telegram').message)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(generateShareMessage('facebook').message)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-black hover:text-white',
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(generateShareMessage('twitter').message)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700 hover:text-white',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'hover:bg-pink-600 hover:text-white',
      shareUrl: `https://www.instagram.com/create/story/?text=${encodeURIComponent(generateShareMessage('instagram').message)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-600 hover:text-white',
      shareUrl: `mailto:?subject=${encodeURIComponent(shareData.message.split('\n')[0])}&body=${encodeURIComponent(generateShareMessage('email').message)}`
    }
  ];

  const handleShare = (platform: string, shareUrl: string) => {
    if (platform === 'Email') {
      window.location.href = shareUrl;
    } else if (platform === 'Instagram') {
      // Instagram doesn't support direct sharing, so copy to clipboard
      navigator.clipboard.writeText(generateShareMessage('instagram').message);
      toast({
        title: "Instagram sharing",
        description: "Message copied to clipboard. Paste it in your Instagram story or post.",
      });
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }

    // Track sharing events
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform.toLowerCase(),
        content_type: content.type,
        item_id: content.id
      });
    }

    onShareComplete?.(platform);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
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
          title: shareData.message.split('\n')[0],
          text: content.description,
          url: shareData.url
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  // Minimal variant for inline sharing
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('WhatsApp', socialShareLinks[0].shareUrl)}
          className="h-8 w-8 p-0"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('LinkedIn', socialShareLinks[4].shareUrl)}
          className="h-8 w-8 p-0"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('Twitter', socialShareLinks[3].shareUrl)}
          className="h-8 w-8 p-0"
        >
          <Twitter className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Compact variant for cards
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">Share</span>
        </div>
        <div className="flex gap-1">
          {socialShareLinks.slice(0, 4).map((social) => {
            const Icon = social.icon;
            return (
              <Button
                key={social.name}
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 ${social.color}`}
                onClick={() => handleShare(social.name, social.shareUrl)}
              >
                <Icon className="h-3 w-3" />
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <Card className="w-full max-w-md">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Share {content.type === 'post' ? 'Post' : 
                   content.type === 'job' ? 'Job' :
                   content.type === 'company' ? 'Company' :
                   content.type === 'college' ? 'College' :
                   content.type === 'article' ? 'Article' : 'Profile'}
          </CardTitle>
          <CardDescription>
            Share this {content.type} with your network
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-semibold text-sm line-clamp-2">{shareData.message.split('\n')[0]}</h4>
          {content.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{content.description}</p>
          )}
          {shareData.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {shareData.hashtags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {shareData.hashtags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{shareData.hashtags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
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
          {shareData.url}
        </div>
      </CardContent>
    </Card>
  );
};
