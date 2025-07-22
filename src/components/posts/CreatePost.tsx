import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  MapPin, 
  Globe,
  Users,
  Lock,
  ImagePlus,
  Video,
  Paperclip
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  file?: File;
}

interface CreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.split('/')[0]; // e.g., "image", "video"
      const fileExtension = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${randomId}.${fileExtension}`;
      const filePath = `attachments/${user?.id}/${filename}`;

      try {
        const { data, error } = await supabase.storage
          .from('community-posts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error uploading file:', error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const url = `${supabase.storageUrl}/community-posts/${data.path}`;
        newAttachments.push({
          id: randomId,
          url: url,
          type: fileType as 'image' | 'video' | 'document',
          file: file,
        });
        toast.success(`${file.name} uploaded successfully!`);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsPosting(true);
    try {
      console.log('Creating post with user:', user.id);
      console.log('Post content:', content);
      
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content,
          post_type: 'text', // Changed from default to 'text'
          author_id: user.id,
          media_urls: attachments.map(att => att.url),
          location: location || null,
          is_public: privacy === 'public',
          tags: []
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', postData);
      onPostCreate?.(postData);
      
      // Reset form
      setContent('');
      setAttachments([]);
      setLocation('');
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

        {/* Media and Options */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ImagePlus className="h-4 w-4" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              File
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
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
              onClick={handleSubmit} 
              disabled={!content.trim() || isPosting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
