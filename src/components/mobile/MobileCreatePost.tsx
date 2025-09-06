import React, { useState, useRef } from 'react';
import { getCustomStorageUrl } from '@/utils/storage';
import { Camera, Image, MapPin, Send, X, Smile, Link2, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { toast } from 'sonner';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import LinkPreview from '@/components/shared/LinkPreview';
import { supabase } from '@/integrations/supabase/client';

interface MobileCreatePostProps {
  onPostCreate?: () => void;
  className?: string;
}

export const MobileCreatePost: React.FC<MobileCreatePostProps> = ({ 
  onPostCreate, 
  className 
}) => {
  const { user } = useAuth();
  const { createPost } = useProfilePosts('global');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [showExtended, setShowExtended] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // URL detection for link previews
  const { detectedUrls } = useUrlDetection(content);

  const handleMediaSelect = (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    const newPreviews: string[] = [];
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === newFiles.length) {
            setMediaPreview(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedMedia(prev => [...prev, ...newFiles]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsPosting(true);
    try {
      const tagList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Upload media if any
      let mediaUrls: string[] = [];
      if (selectedMedia.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        for (let i = 0; i < selectedMedia.length; i++) {
          const file = selectedMedia[i];
          const fileExtension = file.name.split('.').pop();
          const randomId = Math.random().toString(36).substring(2, 15);
          const filename = `${randomId}.${fileExtension}`;
          const filePath = `${user.id}/${filename}`;

          try {
            const { data, error } = await supabase.storage
              .from('post-media')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error('Error uploading file:', error);
              toast.error(`Failed to upload ${file.name}`);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(data.path);
            const customUrl = getCustomStorageUrl(publicUrl);
            mediaUrls.push(customUrl);
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      await createPost.mutateAsync({
        content: content.trim(),
        tags: tagList,
        media_urls: mediaUrls,
        post_type: selectedMedia.some(f => f.type.startsWith('video/')) ? 'video' : 
                   selectedMedia.some(f => f.type.startsWith('image/')) ? 'image' : 'text',
        visibility: 'public'
      });

      // Reset form
      setContent('');
      setTags('');
      setSelectedMedia([]);
      setMediaPreview([]);
      setShowExtended(false);
      
      toast.success('Post created successfully!');
      onPostCreate?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className={`bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-3xl mx-3 mb-4 overflow-hidden ${className}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt="Your avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Create Enhanced Post</p>
            <p className="text-xs text-gray-500">Share your professional insights</p>
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] border-0 bg-gray-50/80 rounded-2xl text-sm placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            onFocus={() => setShowExtended(true)}
          />

          {/* Extended Features */}
          {showExtended && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* Tags Input */}
              <Input
                placeholder="Add tags (comma separated)..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="border-0 bg-gray-50/80 rounded-2xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />

              {/* Media Preview - Keep visible even when posting */}
              {mediaPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-700">Media ({mediaPreview.length})</p>
                    {!isPosting && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {setMediaPreview([]); setSelectedMedia([])}}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className={`grid gap-2 ${mediaPreview.length === 1 ? 'grid-cols-1' : mediaPreview.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {mediaPreview.map((preview, index) => {
                      const file = selectedMedia[index];
                      const isVideo = file?.type.startsWith('video/');
                      return (
                        <div key={index} className="relative group">
                          {isVideo ? (
                            <video
                              src={preview}
                              className="w-full aspect-square object-cover object-center rounded-lg border shadow-sm"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover object-center rounded-lg border shadow-sm"
                            />
                          )}
                          {!isPosting && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeMedia(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Link Previews */}
              {detectedUrls.length > 0 && (
                <div className="space-y-2">
                  {detectedUrls.slice(0, 2).map((urlData, index) => (
                    <LinkPreview 
                      key={`${urlData.url}-${index}`}
                      url={urlData.url}
                      className="border rounded-lg"
                      compact={true}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Photo Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-xs font-medium">Photo</span>
                  </Button>

                  {/* Video Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-medium">Video</span>
                  </Button>

                  {/* Location Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">Location</span>
                  </Button>
                </div>

                {/* Post Button */}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl px-6 font-medium shadow-md transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={isPosting || (!content.trim() && selectedMedia.length === 0)}
                >
                  {isPosting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Action Buttons (when not extended) */}
          {!showExtended && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-4 h-4" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-xl"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="w-4 h-4" />
                  <span className="text-xs">Video</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600 rounded-xl"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Location</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleMediaSelect(e.target.files, 'image')}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleMediaSelect(e.target.files, 'video')}
        />
      </div>
    </Card>
  );
};