
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Linkedin, Twitter, Copy, Check } from 'lucide-react';
import { ShareableContent } from './UniversalShare';
import { useShareContent } from '@/hooks/useShareContent';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QuickShareActionsProps {
  content: ShareableContent;
  className?: string;
}

export const QuickShareActions: React.FC<QuickShareActionsProps> = ({
  content,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const { trackShare } = useShareContent();
  const { toast } = useToast();

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
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

  const handleQuickShare = (platform: string) => {
    const url = generateShareUrl();
    const message = `${content.title}\n\n${content.description || ''}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
      trackShare(platform, content.type, content.id);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickShare('whatsapp')}
        className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickShare('telegram')}
        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
        title="Share on Telegram"
      >
        <Send className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickShare('linkedin')}
        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickShare('twitter')}
        className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
