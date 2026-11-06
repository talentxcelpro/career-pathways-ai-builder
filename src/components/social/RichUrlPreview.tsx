import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(metadata.url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 bg-slate-50 dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-muted/70 transition-all group",
          className
        )}
        onClick={handleClick}
      >
        {metadata.favicon && (
          <img 
            src={metadata.favicon} 
            alt=""
            className="w-4 h-4 rounded shrink-0"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground group-hover:text-blue-600 truncate transition-colors">
            {metadata.title}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">{metadata.domain}</p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 shrink-0 transition-colors" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "cursor-pointer rounded-2xl overflow-hidden border border-slate-200/90 dark:border-border/60 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-card shadow-xs hover:shadow-sm transition-all group w-full",
        className
      )}
      onClick={handleClick}
    >
      {metadata.image && (
        <div className="w-full max-h-[220px] overflow-hidden bg-slate-100 dark:bg-muted/40">
          <img
            src={metadata.image}
            alt="Link preview"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
      
      <div className="p-3.5 sm:p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground tracking-wider uppercase mb-1">
          {metadata.favicon ? (
            <img 
              src={metadata.favicon} 
              alt=""
              className="w-3.5 h-3.5 rounded shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <Globe className="h-3 w-3 shrink-0" />
          )}
          <span className="truncate">{metadata.domain}</span>
        </div>

        <h4 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
          {metadata.title}
        </h4>
        
        {metadata.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {metadata.description}
          </p>
        )}
      </div>
    </div>
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
      <div className={cn("animate-pulse rounded-xl border border-slate-200/70 p-3 bg-muted/30", className)}>
        <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4 mb-1.5"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !metadata) {
    return null;
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
