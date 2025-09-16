import React from 'react';
import { ScrapedContent } from '@/services/ContentScraper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface VideoEmbedProps {
  content: ScrapedContent;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ content }) => {
  return (
    <div className="relative bg-card rounded-lg border overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {content.embedHtml ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: content.embedHtml }}
          />
        ) : content.videoUrl ? (
          <iframe
            src={content.videoUrl}
            className="w-full h-full border-0"
            title={content.title || 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <ExternalLink className="w-6 h-6" />
              </div>
              <p>Video unavailable</p>
            </div>
          </div>
        )}
        
        {/* Tiny source attribution */}
        <div className="absolute bottom-2 right-2">
          <Badge 
            variant="secondary" 
            className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            {content.favicon && (
              <img 
                src={content.favicon} 
                alt="" 
                className="w-3 h-3 mr-1"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            via {content.source}
          </Badge>
        </div>
      </div>

      {/* Content Info */}
      {content.title && (
        <div className="p-4">
          <h3 className="font-medium text-foreground mb-1">{content.title}</h3>
          {content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {content.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};