import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Play,
  MapPin,
  Hash,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaUploadProps {
  onClose?: () => void;
}

export const SocialMediaUpload: React.FC<SocialMediaUploadProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, uploading: imageUploading, progress: imageProgress } = useFileUpload();
  const { uploading: videoUploading, progress: videoProgress, uploadVideo } = useVideoUpload();
  const { createPost } = useProfilePosts();

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || !user) return;

    const file = files[0];
    if (!file) return;

    try {
      setMediaType(type);
      
      if (type === 'image') {
        const url = await uploadFile(file, undefined, 'post-media');
        setSelectedMedia([...selectedMedia, url]);
      } else {
        // For video, we'll use the video upload flow for reels
        const uploadOptions = {
          title: 'New Reel',
          description: content || 'Check out my latest reel!',
          category: 'reel' as const,
          tags,
          visibility: visibility === 'public' ? 'public' as const : 'unlisted' as const
        };
        
        await uploadVideo(file, uploadOptions);
        toast({
          title: "Video Uploaded",
          description: "Your reel has been uploaded successfully!",
        });
        setIsOpen(false);
        onClose?.();
        return;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeMedia = (urlToRemove: string) => {
    setSelectedMedia(selectedMedia.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      toast({
        title: "Content Required",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost.mutateAsync({
        content,
        media_urls: selectedMedia,
        post_type: mediaType === 'video' ? 'video' : 'general',
        tags,
        location: location || undefined,
        visibility: visibility === 'public' ? 'public' : visibility === 'connections' ? 'connections' : 'private',
      });

      toast({
        title: "Post Created",
        description: "Your post has been shared successfully!",
      });

      // Reset form
      setContent('');
      setLocation('');
      setTags([]);
      setSelectedMedia([]);
      setMediaType(null);
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Post creation error:', error);
      toast({
        title: "Post Failed",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUploading = imageUploading || videoUploading;
  const uploadProgress = imageUploading ? imageProgress : videoProgress;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Upload className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <Textarea
              placeholder="What's happening in your career?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Media Upload Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('video-upload')?.click()}
              disabled={isUploading}
            >
              <Video className="h-4 w-4 mr-1" />
              Reel
            </Button>
          </div>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleMediaUpload(e.target.files, 'image')}
          />
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleMediaUpload(e.target.files, 'video')}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4 animate-pulse" />
                Uploading {mediaType}...
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Media Preview */}
          {selectedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selectedMedia.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(url)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddTag} disabled={!currentTag.trim()}>
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Who can see this?</label>
            <div className="flex gap-2">
              <Button
                variant={visibility === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibility('public')}
              >
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Button>
              <Button
                variant={visibility === 'connections' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibility('connections')}
              >
                <Users className="h-3 w-3 mr-1" />
                Connections
              </Button>
              <Button
                variant={visibility === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibility('private')}
              >
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || (!content.trim() && selectedMedia.length === 0)}
              className="flex-1"
            >
              {isSubmitting ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};