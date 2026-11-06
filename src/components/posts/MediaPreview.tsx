import React, { useState } from 'react';
import { getCustomStorageUrl } from '@/utils/storage';
import VideoPlayer from './VideoPlayer';
import { FastImage } from '@/components/common/FastImage';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { UniversalPostContent } from '@/components/network/UniversalPostContent';
import { UniversalPostMedia } from '@/components/network/UniversalPostMedia';

interface MediaPreviewProps {
  content: string;
  mediaUrls?: string[];
  isMessage?: boolean; // For different styling in messages vs posts
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ 
  content, 
  mediaUrls = [], 
  isMessage = false 
}) => {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // When used in social feed posts (not inside private messaging bubbles)
  if (!isMessage) {
    return (
      <div className="space-y-3 w-full">
        {content && <UniversalPostContent content={content} />}
        {mediaUrls && mediaUrls.length > 0 && (
          <UniversalPostMedia mediaUrls={mediaUrls} />
        )}
      </div>
    );
  }

  // When used inside private direct messaging chat bubbles
  const customMediaUrls = mediaUrls.map((url) => getCustomStorageUrl(url));

  return (
    <div className="space-y-1.5 max-w-full">
      {content && (
        <p className="text-xs whitespace-pre-wrap break-words leading-relaxed">{content}</p>
      )}

      {customMediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {customMediaUrls.map((url, idx) => {
            const isVideo = ImageOptimizer.isValidVideoUrl(url);
            return isVideo ? (
              <VideoPlayer key={idx} url={url} className="w-48 h-32 rounded-lg bg-black" />
            ) : (
              <img
                key={idx}
                src={url}
                alt="Attachment"
                loading="lazy"
                onClick={() => setPreviewModalUrl(url)}
                className="w-32 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              />
            );
          })}
        </div>
      )}

      {previewModalUrl && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalUrl(null)}
        >
          <img
            src={previewModalUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
