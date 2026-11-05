import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Copy,
  Check,
  Send,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import { cn } from '@/lib/utils';

export interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  contentType?: 'job' | 'passport' | 'profile' | 'article' | 'tool' | 'general';
  contentId?: string;
  mode?: 'popover' | 'inline' | 'button-only';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showTitle?: boolean;
  className?: string;
  buttonText?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title = 'TalentXcel — Global Career Platform, Jobs & Career Passport',
  description = 'Connect with tech and leadership talent worldwide. Explore verified opportunities on TalentXcel.',
  hashtags = ['TalentXcel', 'CareerGrowth', 'JobSearch', 'TechCareers'],
  contentType = 'general',
  contentId,
  mode = 'popover',
  variant = 'outline',
  size = 'sm',
  showTitle = true,
  className,
  buttonText = 'Share',
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const componentId = useId();

  // Resolve absolute share URL
  const safeUrl = (() => {
    if (url) {
      return url.startsWith('http') ? url : `https://talentxcel.in${url.startsWith('/') ? '' : '/'}${url}`;
    }
    if (typeof window !== 'undefined') {
      const current = window.location.href;
      return current.includes('/storage/v1/object') ? 'https://talentxcel.in' : current;
    }
    return 'https://talentxcel.in';
  })();

  const encodedUrl = encodeURIComponent(safeUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);
  const hashtagsString = hashtags.join(',');

  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20',
      actionUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border-[#25D366]/20',
      actionUrl: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black/10 dark:bg-white/10 text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-foreground/20',
      actionUrl: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodeURIComponent(hashtagsString)}`,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20',
      actionUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white border-[#229ED9]/20',
      actionUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: ExternalLink,
      color: 'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500] hover:text-white border-[#FF4500]/20',
      actionUrl: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-600 hover:text-white border-slate-500/20',
      actionUrl: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
    },
  ];

  const trackShareInitiated = (platform: string) => {
    try {
      GrowthFunnelTracker.track('social_share_initiated', {
        platform,
        content_type: contentType,
        content_id: contentId || safeUrl,
        url: safeUrl,
      });

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share', {
          method: platform,
          content_type: contentType,
          item_id: contentId || safeUrl,
        });
      }
    } catch (e) {}
  };

  const handlePlatformClick = (platform: typeof platforms[0]) => {
    trackShareInitiated(platform.id);

    if (platform.id === 'email') {
      window.location.href = platform.actionUrl;
    } else {
      window.open(
        platform.actionUrl,
        `share-${platform.id}`,
        'width=650,height=520,menubar=no,toolbar=no,status=no,resizable=yes'
      );
    }
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      trackShareInitiated('copy_link');
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  // Apple-inspired trigger: on mobile with navigator.share, directly invoke native share sheet
  const handleTriggerClick = async (e: React.MouseEvent) => {
    // Check if mobile device and navigator.share is available
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      e.preventDefault();
      try {
        trackShareInitiated('native_share');
        await navigator.share({
          title,
          text: description,
          url: safeUrl,
        });
      } catch (err: any) {
        // If user cancelled, don't show popover
        if (err.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
      return;
    }

    setIsOpen(!isOpen);
  };

  // 1. Popover Mode (Apple Style Popover Menu)
  if (mode === 'popover') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleTriggerClick}
            className={cn(
              'rounded-full gap-2 font-medium transition-all shadow-sm',
              'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
              'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
              className
            )}
          >
            <Share2 className="h-4 w-4 text-blue-500" />
            <span>{buttonText}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl space-y-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Share this page</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{title}</p>
          </div>

          {/* Social Platform Grid */}
          <div className="grid grid-cols-4 gap-2">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all duration-150',
                    platform.color
                  )}
                  title={`Share on ${platform.name}`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] leading-tight truncate w-full text-center">
                    {platform.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* One-Click Copy Link Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-muted-foreground truncate select-all">
              {safeUrl}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // 2. Inline Card Mode
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 space-y-4 shadow-sm',
        className
      )}
    >
      {showTitle && (
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-500" />
            Share with Your Network
          </h4>
          <p className="text-xs text-muted-foreground">
            Share verified opportunities across social networks.
          </p>
        </div>
      )}

      {/* Platform Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.id}
              variant="outline"
              size="sm"
              onClick={() => handlePlatformClick(platform)}
              className={cn(
                'rounded-xl text-xs font-medium justify-start gap-2 h-9 border',
                platform.color
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{platform.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Direct Copy Row */}
      <div className="pt-2 flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-muted-foreground truncate select-all">
          {safeUrl}
        </div>
        <Button
          size="sm"
          onClick={copyToClipboard}
          className="rounded-xl text-xs font-bold gap-1.5 shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
