import React from 'react';
import { ScrapedContent } from '@/services/ContentScraper';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface SocialEmbedProps {
  content: ScrapedContent;
}

export const SocialEmbed: React.FC<SocialEmbedProps> = ({ content }) => {
  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'twitter': return 'bg-blue-500';
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'facebook': return 'bg-blue-600';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow max-w-md mx-auto">
      <a 
        href={content.sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        {/* Platform Header with Color */}
        <div className={`flex items-center gap-2 p-3 text-white ${getPlatformColor(content.platform || '')}`}>
          {content.favicon && (
            <img 
              src={content.favicon} 
              alt="" 
              className="w-5 h-5 bg-white rounded-sm p-0.5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="text-sm font-medium">
            {content.source || 'Social Media'}
          </span>
          <ExternalLink className="w-4 h-4 ml-auto group-hover:scale-110 transition-transform" />
        </div>

        {/* Content Preview */}
        <div className="p-4 bg-background">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
            {content.title}
          </h3>
          
          {content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {content.description}
            </p>
          )}

          {/* Enhanced Platform Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs border-current"
              style={{ color: content.platform === 'twitter' ? '#1DA1F2' : 
                             content.platform === 'instagram' ? '#E4405F' :
                             content.platform === 'facebook' ? '#1877F2' :
                             content.platform === 'linkedin' ? '#0A66C2' : '#6B7280' }}
            >
              Click to view full post
            </Badge>
          </div>
        </div>
      </a>
    </div>
  );
};