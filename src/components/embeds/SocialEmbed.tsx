import React from 'react';
import { ScrapedContent } from '@/services/ContentScraper';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialEmbedProps {
  content: ScrapedContent;
}

export const SocialEmbed: React.FC<SocialEmbedProps> = ({ content }) => {
  return (
    <div className="relative bg-card rounded-lg border overflow-hidden">
      {/* Social Post Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center">
            <img 
              src={content.favicon} 
              alt="" 
              className="w-5 h-5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{content.source} Post</h4>
            <p className="text-xs text-muted-foreground">Shared content</p>
          </div>
          
          {/* Tiny source attribution in header */}
          <Badge 
            variant="outline" 
            className="text-[10px] px-2 py-1 opacity-60"
          >
            via {content.source}
          </Badge>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-foreground mb-4">
          {content.description || `Check out this ${content.source} post that was shared in the TalentXcel community.`}
        </p>

        {/* Mock engagement */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>•  •  •</span>
          <span>External content</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Heart className="w-4 h-4 mr-1" />
              Like
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
          
          <a 
            href={content.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Original
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};