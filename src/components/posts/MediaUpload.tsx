
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaUploadProps {
  onMediaUploaded: (urls: string[]) => void;
  existingMedia: string[];
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUploaded, existingMedia }) => {
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingMedia);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to upload media');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const fileType = file.type.split('/')[0];
        if (!['image', 'video'].includes(fileType)) {
          toast.error(`File type ${file.type} is not supported`);
          continue;
        }

        // Validate file size (50MB limit for videos, 10MB for others)
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeMB = file.type.startsWith('video/') ? 50 : 10;
          toast.error(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
          continue;
        }

        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }

      const newMediaUrls = [...mediaUrls, ...uploadedUrls];
      setMediaUrls(newMediaUrls);
      onMediaUploaded(newMediaUrls);
      
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
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
