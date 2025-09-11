import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrapedContent } from '@/services/ContentScraper';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MessageCircle, Heart, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Minimal globals for external SDKs
declare global {
  interface Window {
    twttr?: any;
    instgrm?: any;
    FB?: any;
  }
}

const loadScript = (src: string, id: string) => {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById(id)) return resolve(true);
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.id = id;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
};

interface SocialEmbedProps {
  content: ScrapedContent;
}

export const SocialEmbed: React.FC<SocialEmbedProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  const url = useMemo(() => {
    try { return new URL(content.sourceUrl); } catch { return null; }
  }, [content.sourceUrl]);

  const host = url?.hostname || '';
  const platform = useMemo<'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'generic'>(() => {
    if (/(^|\.)twitter\.com$/.test(host) || /(^|\.)x\.com$/.test(host)) return 'twitter';
    if (/(^|\.)instagram\.com$/.test(host)) return 'instagram';
    if (/(^|\.)facebook\.com$/.test(host) || /(^|\.)fb\.com$/.test(host)) return 'facebook';
    if (/(^|\.)linkedin\.com$/.test(host)) return 'linkedin';
    return 'generic';
  }, [host]);

  // Try to render native embeds for major platforms
  useEffect(() => {
    if (!url || platform === 'generic') return;
    let cancelled = false;

    const render = async () => {
      setEmbedFailed(false);
      try {
        if (platform === 'twitter') {
          await loadScript('https://platform.twitter.com/widgets.js', 'tw-widget');
          window.twttr?.widgets?.load(containerRef.current || undefined);
        } else if (platform === 'instagram') {
          await loadScript('https://www.instagram.com/embed.js', 'ig-embed');
          window.instgrm?.Embeds?.process?.(containerRef.current);
        } else if (platform === 'facebook') {
          await loadScript('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0', 'fb-sdk');
          window.FB?.XFBML?.parse?.(containerRef.current || undefined);
        }
        if (!cancelled) setEmbedReady(true);
      } catch (e) {
        console.warn('Social embed script failed:', e);
        if (!cancelled) setEmbedFailed(true);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [platform, url]);

  const linkedInEmbedSrc = useMemo(() => {
    if (!url) return null;
    // Try to extract URN or activity id from URL
    const decoded = decodeURIComponent(url.href);
    const urn = decoded.match(/urn:li:(?:share|activity):\d+/)?.[0];
    if (urn) return `https://www.linkedin.com/embed/feed/update/${encodeURIComponent(urn)}`;
    const m = url.pathname.match(/activity-(\d+)/);
    if (m) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${m[1]}`;
    return null;
  }, [url]);

  const renderNative = () => {
    if (!url) return null;
    switch (platform) {
      case 'twitter':
        return (
          <blockquote className="twitter-tweet" data-dnt="true">
            <a href={url.href}>View on X</a>
          </blockquote>
        );
      case 'instagram':
        return (
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url.href}
            data-instgrm-version="14"
            style={{ background: 'transparent', width: '100%' }}
          >
            <a href={url.href}>View on Instagram</a>
          </blockquote>
        );
      case 'facebook':
        return (
          <div className="fb-post" data-href={url.href} data-width="auto"></div>
        );
      case 'linkedin':
        return linkedInEmbedSrc ? (
          <iframe
            src={linkedInEmbedSrc}
            width="100%"
            height="420"
            loading="lazy"
            allow="fullscreen; clipboard-write"
            title="LinkedIn post"
            className="rounded-md border"
            style={{ border: '0' }}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <article className="relative bg-card rounded-lg border overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-foreground/30">
            {content.favicon && (
              <img
                src={content.favicon}
                alt=""
                className="w-5 h-5"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{content.source} Post</h4>
            <p className="text-xs text-muted-foreground">Shared content</p>
          </div>
          <Badge variant="outline" className="text-[10px] px-2 py-1 opacity-60">via {content.source}</Badge>
        </div>
      </header>

      {/* Body */}
      <div className="p-4">
        {/* Native embed (if supported) */}
        <div ref={containerRef} className="mb-4">
          {renderNative()}
          {platform !== 'generic' && !embedReady && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              Loading {platform} embed…
            </div>
          )}
          {platform !== 'generic' && embedFailed && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="w-4 h-4" />
              Could not render {platform} embed. Showing summary below.
            </div>
          )}
        </div>

        {/* Fallback summary */}
        <p className="text-foreground mb-4">
          {content.description || `Check out this ${content.source} post that was shared in the community.`}
        </p>

        {/* Mock engagement */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>•  •  •</span>
          <span>External content</span>
        </div>

        {/* Actions */}
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

          <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Original
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
};