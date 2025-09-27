import React, { useState, useCallback } from 'react';
import { getCustomStorageUrl } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { optimizedStorage } from '@/utils/optimizedStorage';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { FastImage } from '@/components/common/FastImage';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedMediaUploadProps {
  onMediaUploaded: (urls: string[]) => void;
  existingMedia: string[];
  maxFiles?: number;
  showPreview?: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  blurDataUrl?: string;
  isUploading?: boolean;
}

export const EnhancedMediaUpload: React.FC<EnhancedMediaUploadProps> = ({
  onMediaUploaded,
  existingMedia,
  maxFiles = 4,
  showPreview = true
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    existingMedia.map(url => ({
      id: Date.now().toString() + Math.random(),
      url,
      type: ImageOptimizer.isValidVideoUrl(url) ? 'video' : 'image'
    }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (mediaItems.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    const newItems: MediaItem[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const itemId = Date.now().toString() + i;
        const isVideo = file.type.startsWith('video/');

        // Add uploading placeholder
        const uploadingItem: MediaItem = {
          id: itemId,
          url: URL.createObjectURL(file),
          type: isVideo ? 'video' : 'image',
          isUploading: true
        };
        
        setMediaItems(prev => [...prev, uploadingItem]);

        try {
          if (isVideo) {
            // Optimized video upload
            const result = await optimizedStorage.uploadFile(
              'post-media',
              `${user.id}/videos/${Date.now()}_${file.name}`,
              file,
              {
                cacheControl: '31536000',
                upsert: true
              }
            );

            if (result.error) throw result.error;

            const publicUrl = await optimizedStorage.getPublicUrl('post-media', result.data.path);
            const videoUrl = getCustomStorageUrl(publicUrl);
            
            const finalItem: MediaItem = {
              id: itemId,
              url: videoUrl,
              type: 'video'
            };
            
            newItems.push(finalItem);
          } else {
            // Enhanced image upload with thumbnails and blur
            const result = await ImageOptimizer.uploadFile(file, user.id, 'images');
            
            const finalItem: MediaItem = {
              id: itemId,
              url: result.fullUrl,
              thumbnailUrl: result.thumbnailUrl,
              type: 'image',
              blurDataUrl: result.blurHash
            };
            
            newItems.push(finalItem);
          }

          // Update the uploading item with final data
          setMediaItems(prev => 
            prev.map(item => 
              item.id === itemId 
                ? { ...newItems[newItems.length - 1], isUploading: false }
                : item
            )
          );
        } catch (error) {
          console.error('Upload failed for file:', file.name, error);
          // Remove failed upload
          setMediaItems(prev => prev.filter(item => item.id !== itemId));
        }
      }

      // Update parent component with all URLs
      const allUrls = [...mediaItems, ...newItems].map(item => item.url);
      onMediaUploaded(allUrls);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [mediaItems, maxFiles, onMediaUploaded]);

  const removeMedia = useCallback((itemId: string) => {
    setMediaItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      onMediaUploaded(updated.map(item => item.url));
      return updated;
    });
  }, [onMediaUploaded]);

  return (
    <div className="w-full space-y-4">
      {/* Upload buttons */}
      <div className="flex gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={isUploading || mediaItems.length >= maxFiles}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            disabled={isUploading || mediaItems.length >= maxFiles}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Add Photos
          </Button>
        </label>

        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={isUploading || mediaItems.length >= maxFiles}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            disabled={isUploading || mediaItems.length >= maxFiles}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Add Videos
          </Button>
        </label>
      </div>

      {/* Media preview grid */}
      {showPreview && mediaItems.length > 0 && (
        <div className={cn(
          "grid gap-3",
          mediaItems.length === 1 ? "grid-cols-1" :
          mediaItems.length === 2 ? "grid-cols-2" : 
          "grid-cols-2 md:grid-cols-3"
        )}>
          {mediaItems.map((item) => (
            <div key={item.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <FastImage
                    src={item.thumbnailUrl || item.url}
                    alt="Preview"
                    className="w-full h-full"
                    loading="lazy"
                    thumbnail={!!item.thumbnailUrl}
                    blurDataUrl={item.blurDataUrl}
                    showBlurPlaceholder={true}
                  />
                )}
                
                {/* Upload progress overlay */}
                {item.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                
                {/* Remove button */}
                {!item.isUploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload status */}
      {isUploading && (
        <div className="text-sm text-muted-foreground">
          Uploading media files...
        </div>
      )}
    </div>
  );
};