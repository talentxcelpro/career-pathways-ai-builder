
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2 } from 'lucide-react';
import { UniversalShare, ShareableContent } from './UniversalShare';
import { useShareContent } from '@/hooks/useShareContent';

interface ShareButtonProps {
  content: ShareableContent;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  variant = 'ghost',
  size = 'sm',
  showText = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackShare } = useShareContent();

  const handleShareComplete = (platform: string) => {
    trackShare(platform, content.type, content.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          {showText && <span>Share</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>
        <UniversalShare
          content={content}
          showTitle={false}
          onShareComplete={handleShareComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
