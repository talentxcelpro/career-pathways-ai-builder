import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';
import { useUrlPreview, UrlMetadata } from '@/hooks/useUrlPreview';
import { cn } from '@/lib/utils';

interface RichUrlPreviewProps {
  url: string;
  className?: string;
  compact?: boolean;
}

interface UrlPreviewCardProps {
  metadata: UrlMetadata;
  compact?: boolean;
  className?: string;
}

const UrlPreviewCard: React.FC<UrlPreviewCardProps> = ({ metadata, compact, className }) => {
  const handleClick = () => {
    window.open(metadata.url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors",
          className
        )}
        onClick={handleClick}
      >
        {metadata.favicon && (
          <img 
            src={metadata.favicon} 
            alt="Favicon"
            className="w-4 h-4 rounded"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{metadata.title}</p>
          <p className="text-xs text-muted-foreground truncate">{metadata.domain}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card 
      className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {metadata.image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={metadata.image}
              alt="Link preview"
              className="w-full h-full object-cover"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {metadata.favicon && (
              <img 
                src={metadata.favicon} 
                alt="Favicon"
                className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {metadata.title}
              </h3>
              
              {metadata.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {metadata.description}
                </p>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>{metadata.domain}</span>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RichUrlPreview: React.FC<RichUrlPreviewProps> = ({ 
  url, 
  className,
  compact = false 
}) => {
  const { metadata, loading, error } = useUrlPreview(url);

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-muted rounded-lg h-20 w-full"></div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground p-2", className)}>
        <Globe className="h-4 w-4" />
        <span className="truncate">{url}</span>
      </div>
    );
  }

  return <UrlPreviewCard metadata={metadata} compact={compact} className={className} />;
};

// Hook to detect URLs in text
export const useUrlDetection = (text: string) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  
  return {
    urls,
    hasUrls: urls.length > 0,
    textWithoutUrls: text.replace(urlRegex, '').trim()
  };
};