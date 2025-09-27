
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, FileText, X } from "lucide-react";
import { useOptimizedStorage } from "@/hooks/useOptimizedStorage";
import { toast } from "sonner";

interface MediaUploadProps {
  onMediaUploaded: (urls: string[]) => void;
  existingMedia: string[];
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUploaded, existingMedia }) => {
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingMedia);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadBatch, uploading, progress } = useOptimizedStorage({
    bucket: 'post-media',
    maxFileSize: 50 * 1024 * 1024, // 50MB for videos
    allowedTypes: ['image/*', 'video/*'],
    onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      // Prepare files for batch upload
      const filesToUpload = Array.from(files).map(file => {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const fileName = `talentxcel_media_${timestamp}_${sanitizedFileName}`;
        
        return { file, path: fileName };
      });

      const result = await uploadBatch(filesToUpload);

      if (result.successful.length > 0) {
        const uploadedUrls = result.successful.map(item => item.url);
        const newMediaUrls = [...mediaUrls, ...uploadedUrls];
        setMediaUrls(newMediaUrls);
        onMediaUploaded(newMediaUrls);
      }

      if (result.failed.length > 0) {
        console.error('Some uploads failed:', result.failed);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    }
  };

  const removeMedia = (urlToRemove: string) => {
    const newMediaUrls = mediaUrls.filter(url => url !== urlToRemove);
    setMediaUrls(newMediaUrls);
    onMediaUploaded(newMediaUrls);
  };

  const getMediaType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(extension || '')) return 'video';
    return 'file';
  };

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <div className="flex space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          accept="image/*,video/*"
          multiple
          className="hidden"
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Image className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Photo'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Video className="h-4 w-4 mr-2" />
          Video
        </Button>
        
        <Button variant="outline" size="sm" disabled>
          <FileText className="h-4 w-4 mr-2" />
          Document
        </Button>
      </div>

      {/* Media preview */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative group">
              {getMediaType(url) === 'image' ? (
                <img 
                  src={url} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : getMediaType(url) === 'video' ? (
                <video 
                  src={url}
                  className="w-full h-32 object-cover rounded-lg"
                  controls
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
