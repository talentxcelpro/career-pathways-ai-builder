import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  FileText, 
  MapPin, 
  Users, 
  Globe,
  Lock,
  X,
  Send,
  Smile,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmojiPicker } from './EmojiPicker';
import { LinkPreview } from '@/components/shared/LinkPreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [attachments, setAttachments] = useState<{ url: string; type: string; name: string }[]>([]);
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState<'image' | 'video' | 'document' | null>(null);

  const { uploadFile, uploading } = useFileUpload({
    bucket: 'post-media',
    maxSize: 50 * 1024 * 1024, // 50MB for videos
    allowedTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
    { value: 'connections', label: 'Connections', icon: Users, description: 'Only your connections can see this' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this' }
  ];

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Detect URLs in the content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = value.match(urlRegex) || [];
    setDetectedLinks([...new Set(links)]); // Remove duplicates
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
  };

  const handleFileUpload = (type: 'image' | 'video' | 'document') => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadType) return;

    try {
      const uploadedUrl = await uploadFile(file, undefined, 'post-media');
      setAttachments(prev => [...prev, {
        url: uploadedUrl,
        type: currentUploadType,
        name: file.name
      }]);
      toast.success(`${currentUploadType.charAt(0).toUpperCase() + currentUploadType.slice(1)} uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setCurrentUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setShowLocationInput(true);
          toast.success('Location detected');
        },
        () => {
          toast.error('Unable to get location');
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    setIsPosting(true);
    try {
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content,
          author_id: user?.id,
          media_urls: attachments.map(att => att.url),
          location: location || null,
          is_public: privacy === 'public'
        })
        .select()
        .single();

      if (error) throw error;

      onPostCreate?.(postData);
      
      // Reset form
      setContent('');
      setAttachments([]);
      setDetectedLinks([]);
      setLocation('');
      setShowLocationInput(false);
      setPrivacy('public');
      
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const currentPrivacy = privacyOptions.find(opt => opt.value === privacy);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{user?.user_metadata?.full_name || 'Your Name'}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  const nextIndex = (privacyOptions.findIndex(opt => opt.value === privacy) + 1) % privacyOptions.length;
                  setPrivacy(privacyOptions[nextIndex].value as any);
                }}
              >
                {currentPrivacy && (
                  <>
                    <currentPrivacy.icon className="h-3 w-3 mr-1" />
                    {currentPrivacy.label}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[100px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
          />

          {/* Link Previews */}
          {detectedLinks.length > 0 && (
            <div className="space-y-3">
              {detectedLinks.map((link, index) => (
                <LinkPreview key={index} url={link} />
              ))}
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative">
                  {attachment.type === 'image' && (
                    <div className="relative">
                      <img src={attachment.url} alt={attachment.name} className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {attachment.type === 'video' && (
                    <div className="relative">
                      <video src={attachment.url} className="w-full h-48 object-cover rounded-lg" controls />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {attachment.type === 'document' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {attachment.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeAttachment(index)}
                      />
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Location Input */}
          {showLocationInput && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Add location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button variant="ghost" size="sm" onClick={() => setShowLocationInput(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload('image')}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload('video')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload('document')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <EmojiPicker onEmojiSelect={handleEmojiSelect}>
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </EmojiPicker>
            <Button
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={handlePost} 
            disabled={!content.trim() || isPosting || uploading}
            className="animate-fade-in"
          >
            {isPosting || uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? 'Uploading...' : 'Posting...'}
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={currentUploadType === 'image' ? 'image/*' : currentUploadType === 'video' ? 'video/*' : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};