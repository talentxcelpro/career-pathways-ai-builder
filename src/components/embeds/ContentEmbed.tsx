import React, { useState, useEffect } from 'react';
import { ContentScraper, ScrapedContent } from '@/services/ContentScraper';
import { VideoEmbed } from './VideoEmbed';
import { ArticleEmbed } from './ArticleEmbed';
import { SocialEmbed } from './SocialEmbed';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, AlertCircle } from 'lucide-react';

interface ContentEmbedProps {
  url: string;
  className?: string;
}

export const ContentEmbed: React.FC<ContentEmbedProps> = ({ url, className }) => {
  const [content, setContent] = useState<ScrapedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scrapeContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const scrapedContent = await ContentScraper.scrapeUrl(url);
        
        if (scrapedContent) {
          setContent(scrapedContent);
        } else {
          setError('Could not load content');
        }
      } catch (err) {
        setError('Failed to load content');
        console.error('Error scraping content:', err);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      scrapeContent();
    }
  }, [url]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !content) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <span>{error || 'Could not load content'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render based on content type
  switch (content.type) {
    case 'video':
      return <VideoEmbed content={content} />;
    case 'article':
      return <ArticleEmbed content={content} />;
    case 'social':
      return <SocialEmbed content={content} />;
    default:
      return <ArticleEmbed content={content} />;
  }
};