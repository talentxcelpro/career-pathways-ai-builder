
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, Facebook, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const openShareDialog = (platform: keyof typeof shareLinks) => {
    window.open(
      shareLinks[platform],
      'share-dialog',
      'width=626,height=436,resizable=yes,scrollbars=yes'
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-4 w-4" />
          <span className="font-medium">Share this</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openShareDialog('facebook')}
            className="flex-1"
          >
            <Facebook className="h-4 w-4 mr-1" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openShareDialog('twitter')}
            className="flex-1"
          >
            <Twitter className="h-4 w-4 mr-1" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openShareDialog('linkedin')}
            className="flex-1"
          >
            <Linkedin className="h-4 w-4 mr-1" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
