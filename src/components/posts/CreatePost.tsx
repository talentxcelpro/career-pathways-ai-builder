
import React, { useState, useRef } from 'react';
import { getCustomStorageUrl } from '@/utils/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  MapPin, 
  Globe,
  Users,
  Lock,
  ImagePlus,
  Video,
  Paperclip,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import LinkPreview from '@/components/shared/LinkPreview';
// TEMPORARILY DISABLED TXC - import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { optimizedStorage } from '@/utils/optimizedStorage';

interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  file?: File;
  name: string;
}

interface CreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  // TEMPORARILY DISABLED TXC - const { triggerPostCreated, triggerArticlePosted } = useTXCIntegration();
  const [content, setContent] = useState('');
  
  // URL detection for link previews
  const { detectedUrls } = useUrlDetection(content);
  
  // Debug logging
  console.log('🔍 CreatePost - Current content:', content);
  console.log('🔗 CreatePost - Detected URLs:', detectedUrls);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const fileType = file.type.split('/')[0];
      if (type === 'image' && fileType !== 'image') {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (type === 'video' && fileType !== 'video') {
        toast.error(`${file.name} is not a video file`);
        continue;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 50MB.`);
        continue;
      }

      const fileExtension = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${randomId}.${fileExtension}`;
      const filePath = `${user?.id}/${filename}`;

      try {
        const result = await optimizedStorage.uploadFile(
          'post-media',
          filePath,
          file,
          {
            cacheControl: '31536000',
            upsert: true
          }
        );

        if (result.error) {
          console.error('Error uploading file:', result.error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const publicUrl = await optimizedStorage.getPublicUrl('post-media', result.data.path);
        const url = getCustomStorageUrl(publicUrl);
        newAttachments.push({
          id: randomId,
          url: url,
          type: type,
          file: file,
          name: file.name,
        });
        toast.success(`${file.name} uploaded successfully!`);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsUploading(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleLocationClick = () => {
    setShowLocationInput(!showLocationInput);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success('Location detected!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    console.log('Content:', content);
    console.log('User:', user);
    console.log('Is posting:', isPosting);
    console.log('Is uploading:', isUploading);
    
    if (!content.trim()) {
      console.log('❌ No content provided');
      toast.error('Please write something before posting');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user found');
      toast.error('You must be logged in to create a post');
      return;
    }

    console.log('✅ Starting post creation');
    setIsPosting(true);
    try {
      console.log('Creating post with user:', user.id);
      console.log('Post content:', content);
      
      // Prepare link previews data
      const linkPreviews = detectedUrls.map(urlData => ({
        url: urlData.url
      }));

      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content,
          post_type: 'text',
          author_id: user.id,
          user_id: user.id,
          media_urls: attachments.map(att => att.url),
          location: location || null,
          visibility: privacy,
          tags: [],
          link_previews: linkPreviews.length > 0 ? linkPreviews : null
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', postData);
      onPostCreate?.(postData);
      
      // TEMPORARILY DISABLED TXC TRIGGERS
      // const isLongContent = content.length > 500; // Consider articles as longer content
      // if (isLongContent) {
      //   await triggerArticlePosted();
      // } else {
      //   await triggerPostCreated();
      // }
      
      // Reset form
      setContent('');
      setAttachments([]);
      setLocation('');
      setShowLocationInput(false);
      setPrivacy('public');
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files, 'image')}
          accept="image/*"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileUpload(e.target.files, 'video')}
          accept="video/*"
          multiple
          className="hidden"
        />

        {/* Location Input */}
        {showLocationInput && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Add Location</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or click to detect"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getCurrentLocation}
                className="whitespace-nowrap"
              >
                Detect
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowLocationInput(false);
                  setLocation('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Media Preview */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  {attachment.type === 'image' ? (
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video 
                      src={attachment.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link Previews */}
        {detectedUrls.length > 0 && (
          <div className="mb-4 space-y-2">
            {detectedUrls.map((urlData, index) => (
              <LinkPreview 
                key={`${urlData.url}-${index}`}
                url={urlData.url}
                className="border rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Media and Options */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={handlePhotoClick}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Photo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleVideoClick}
              disabled={isUploading}
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1" disabled>
              <Paperclip className="h-4 w-4" />
              File
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleLocationClick}
            >
              <MapPin className="h-4 w-4" />
              Location
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {privacy === 'public' && <Globe className="h-4 w-4 text-green-600" />}
              {privacy === 'connections' && <Users className="h-4 w-4 text-blue-600" />}
              {privacy === 'private' && <Lock className="h-4 w-4 text-gray-600" />}
              <select 
                value={privacy} 
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="text-sm border-0 bg-transparent"
              >
                <option value="public">Public</option>
                <option value="connections">Connections</option>
                <option value="private">Private</option>
              </select>
            </div>

            <Button 
              onClick={() => {
                console.log('🔴 Button clicked!');
                console.log('Button disabled?', !content.trim() || isPosting || isUploading);
                console.log('Content trim check:', !content.trim());
                console.log('Is posting:', isPosting);
                console.log('Is uploading:', isUploading);
                handleSubmit();
              }}
              disabled={!content.trim() || isPosting || isUploading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
