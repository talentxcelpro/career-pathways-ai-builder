import React, { useState, useEffect } from 'react';
import { useResolvedMediaUrl } from '@/hooks/usePostMedia';
import { Maximize2, X, Download, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface UniversalPostMediaProps {
  mediaUrls?: string[];
  featuredImageUrl?: string;
  postType?: string;
  headline?: string;
  className?: string;
}

const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mkv') ||
    url.includes('/videos/') ||
    url.includes('/video/') ||
    url.includes('post-videos') ||
    url.includes('content-type=video')
  );
};

export const UniversalPostMedia: React.FC<UniversalPostMediaProps> = ({
  mediaUrls = [],
  featuredImageUrl,
  postType,
  headline,
  className = '',
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Combine featured image and mediaUrls
  const allUrls: string[] = [];
  if (featuredImageUrl && !allUrls.includes(featuredImageUrl)) {
    allUrls.push(featuredImageUrl);
  }
  if (Array.isArray(mediaUrls)) {
    for (const url of mediaUrls) {
      if (url && !allUrls.includes(url)) {
        allUrls.push(url);
      }
    }
  }

  // Resolve primary media through storage helper
  const primaryMedia = allUrls[0] || null;
  const { url: resolvedPrimaryUrl } = useResolvedMediaUrl(primaryMedia);

  // Escape key handler for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxUrl(null);
      }
    };
    if (lightboxUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl]);

  if (allUrls.length === 0) return null;

  const isVideo = isVideoUrl(primaryMedia) || postType === 'video';

  return (
    <>
      <div className={`w-full overflow-hidden ${className}`}>
        {isVideo ? (
          /* Video Renderer: Never cropped, native player */
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-border/60 bg-black flex items-center justify-center">
            <video
              src={resolvedPrimaryUrl || primaryMedia}
              controls
              playsInline
              preload="metadata"
              className="w-full h-auto max-w-full max-h-[85vh] object-contain mx-auto rounded-2xl bg-black"
            />
          </div>
        ) : allUrls.length === 1 ? (
          /* Single Image: CRITICAL REQUIREMENT — NEVER CROPPED, PRESERVES NATURAL RATIO */
          <div className="group relative w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-border/60 bg-slate-100/70 dark:bg-slate-900/50 flex items-center justify-center transition-colors">
            <img
              src={resolvedPrimaryUrl || primaryMedia}
              alt={headline || "Post media attachment"}
              loading="lazy"
              className="w-full h-auto max-w-full max-h-[85vh] object-contain object-center mx-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setLightboxUrl(resolvedPrimaryUrl || primaryMedia)}
            />
            
            {/* Quick Full-Screen Lightbox Action Button */}
            <button
              type="button"
              title="View full image"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxUrl(resolvedPrimaryUrl || primaryMedia);
              }}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : allUrls.length === 2 ? (
          /* 2 Images Grid */
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {allUrls.map((url, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-border/60 bg-slate-100/70 dark:bg-slate-900/50 flex items-center justify-center aspect-[4/3] cursor-pointer"
                onClick={() => setLightboxUrl(url)}
              >
                <img
                  src={url}
                  alt={`Post image ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        ) : (
          /* 3+ Images Grid */
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {allUrls.slice(0, 4).map((url, idx) => {
              const isLast = idx === 3 && allUrls.length > 4;
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-border/60 bg-slate-100/70 dark:bg-slate-900/50 flex items-center justify-center aspect-square cursor-pointer"
                  onClick={() => setLightboxUrl(url)}
                >
                  <img
                    src={url}
                    alt={`Post image ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  />
                  {isLast && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center text-white font-extrabold text-lg sm:text-xl">
                      +{allUrls.length - 3}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal for High-Resolution Full-Image Viewing */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          {/* Top Bar with Controls */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between py-2 text-white mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-slate-300 font-medium truncate max-w-md">
              {headline || 'TalentXcel Full Resolution Image'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={lightboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full Image Container */}
          <div 
            className="relative flex-1 flex items-center justify-center max-w-6xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt={headline || "High resolution post media"}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
