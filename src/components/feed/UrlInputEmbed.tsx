import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentEmbed } from '@/components/embeds/ContentEmbed';
import { Link, X } from 'lucide-react';
import { toast } from 'sonner';

interface UrlInputEmbedProps {
  onEmbedCreated?: (url: string) => void;
}

export const UrlInputEmbed: React.FC<UrlInputEmbedProps> = ({ onEmbedCreated }) => {
  const [url, setUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      new URL(url); // Validate URL
      setEmbedUrl(url);
      onEmbedCreated?.(url);
      toast.success('Content loaded successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const clearEmbed = () => {
    setEmbedUrl(null);
    setUrl('');
    setShowInput(false);
  };

  if (embedUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Embedded Content</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearEmbed}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ContentEmbed url={embedUrl} />
      </div>
    );
  }

  if (!showInput) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowInput(true)}
        className="w-full justify-start gap-2"
      >
        <Link className="w-4 h-4" />
        Add link to embed content
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste URL (YouTube, Facebook, Instagram, articles...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button type="submit" size="sm">
          Embed
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => setShowInput(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste any URL to create a native-looking embed in your post
      </p>
    </form>
  );
};