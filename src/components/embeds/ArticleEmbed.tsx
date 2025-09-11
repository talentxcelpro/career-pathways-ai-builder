import React from 'react';
import { ScrapedContent } from '@/services/ContentScraper';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface ArticleEmbedProps {
  content: ScrapedContent;
}

export const ArticleEmbed: React.FC<ArticleEmbedProps> = ({ content }) => {
  return (
    <div className="relative bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      <a 
        href={content.sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {/* Article Image */}
        {content.image && (
          <div className="relative aspect-[2/1] bg-muted">
            <img
              src={content.image}
              alt={content.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
            
            {/* Tiny source attribution on image */}
            <div className="absolute bottom-2 right-2">
              <Badge 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-0 opacity-70"
              >
                <img 
                  src={content.favicon} 
                  alt="" 
                  className="w-3 h-3 mr-1"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                via {content.source}
              </Badge>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                {content.title}
              </h3>
              
              {content.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {content.description}
                </p>
              )}

              {/* Source info - only show if no image */}
              {!content.image && (
                <div className="flex items-center gap-2">
                  <img 
                    src={content.favicon} 
                    alt="" 
                    className="w-4 h-4"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-xs text-muted-foreground">
                    via {content.source}
                  </span>
                </div>
              )}
            </div>
            
            <ExternalLink className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
          </div>
        </div>
      </a>
    </div>
  );
};