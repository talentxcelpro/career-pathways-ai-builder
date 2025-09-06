
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2 } from 'lucide-react';
import { UniversalShare, ShareableContent } from './UniversalShare';
import { useShareContent } from '@/hooks/useShareContent';
import { useNativeShare } from '@/hooks/useNativeShare';

interface ShareButtonProps {
  content: ShareableContent;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
  // Enhanced for social post sharing
  postData?: {
    content: string;
    mediaUrls?: string[];
    authorName?: string;
    profileUrl?: string;
  };
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  variant = 'ghost',
  size = 'sm',
  showText = true,
  className = '',
  postData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackShare } = useShareContent();
  const { canShare, sharePostWithFallback } = useNativeShare();

  const handleNativeShare = async () => {
    if (postData && canShare()) {
      try {
        await sharePostWithFallback(postData);
        trackShare('native', content.type, content.id);
        return;
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
    // Fallback to dialog
    setIsOpen(true);
  };

  const handleShareComplete = (platform: string) => {
    trackShare(platform, content.type, content.id);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`gap-2 transition-smooth hover:scale-105 ${className}`}
        onClick={handleNativeShare}
      >
        <Share2 className="h-4 w-4" />
        {showText && <span>Share</span>}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Content
          </DialogTitle>
        </DialogHeader>
        <UniversalShare
          content={content}
          showTitle={false}
          onShareComplete={handleShareComplete}
        />
        </DialogContent>
      </Dialog>
    </>
  );
};
