import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Github, Youtube, Twitter, Linkedin } from 'lucide-react';
import { useUrlPreview } from '@/hooks/useUrlPreview';

interface LinkPreviewProps {
  url: string;
  className?: string;
  compact?: boolean;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className = '', compact = false }) => {
  const { metadata, loading, error } = useUrlPreview(url);
  const [fallbackMetadata, setFallbackMetadata] = useState<any>(null);

  useEffect(() => {
    if (error || !metadata) {
      // Create fallback metadata if URL preview fails
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        const emoji = getEmojiForDomain(domain);
        
        setFallbackMetadata({
          title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Link`,
          description: url,
          domain,
          emoji
        });
      } catch (urlError) {
        setFallbackMetadata({
          title: 'External Link',
          description: url,
          domain: 'unknown',
          emoji: '🔗'
        });
      }
    }
  }, [url, error, metadata]);

  const displayMetadata = metadata || fallbackMetadata;

  const getEmojiForDomain = (domain: string): string => {
    if (domain.includes('github')) return '🐙';
    if (domain.includes('youtube')) return '📺';
    if (domain.includes('twitter') || domain.includes('x.com')) return '🐦';
    if (domain.includes('linkedin')) return '💼';
    if (domain.includes('instagram')) return '📷';
    if (domain.includes('facebook')) return '📘';
    if (domain.includes('stackoverflow')) return '📚';
    if (domain.includes('medium')) return '📖';
    if (domain.includes('dev.to')) return '👨‍💻';
    if (domain.includes('codepen')) return '🖊️';
    if (domain.includes('figma')) return '🎨';
    if (domain.includes('dribbble')) return '🏀';
    if (domain.includes('behance')) return '🎭';
    return '🔗';
  };

  const getIconForDomain = (domain: string) => {
    if (domain.includes('github')) return Github;
    if (domain.includes('youtube')) return Youtube;
    if (domain.includes('twitter') || domain.includes('x.com')) return Twitter;
    if (domain.includes('linkedin')) return Linkedin;
    return Globe;
  };

  if (loading) {
    return (
      <Card className={`p-4 animate-pulse ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!displayMetadata) return null;

  const IconComponent = getIconForDomain(displayMetadata.domain || 'unknown');

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{displayMetadata.emoji || getEmojiForDomain(displayMetadata.domain || 'unknown')}</span>
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm truncate">{displayMetadata.title || 'Link Preview'}</h4>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {displayMetadata.description || 'Click to visit this link'}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {displayMetadata.domain || displayMetadata.site_name || 'External Site'}
              </Badge>
            </div>
          </div>
        </div>
        
        {(displayMetadata.image || displayMetadata.image_url) && (
          <div className="mt-3">
            <img 
              src={displayMetadata.image || displayMetadata.image_url} 
              alt={displayMetadata.title || 'Link preview'}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </a>
    </Card>
  );
};

export default LinkPreview;