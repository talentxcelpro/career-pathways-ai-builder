import React, { useEffect, useState } from 'react';
import { Image, Video, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LinkPreview from '@/components/shared/LinkPreview';
import { UserAvatar } from '@/components/common/UserAvatar';

interface CurrentProfile {
  full_name: string | null;
  profile_picture_url: string | null;
}

export const PostCreation = () => {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hiddenPreviews, setHiddenPreviews] = useState<Set<string>>(new Set());
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile | null>(null);

  const { uploadFile, uploading } = useFileUpload({
    bucket: 'post-media',
    allowedTypes: ['image/*', 'video/*'],
    maxSize: 50 * 1024 * 1024,
  });

  const { createPost } = useProfilePosts('global');
  const { detectedUrls } = useUrlDetection(content);

  const visibleUrls = detectedUrls.filter(({ url }) => !hiddenPreviews.has(url));

  useEffect(() => {
    let isMounted = true;

    const loadCurrentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, profile_picture_url')
        .eq('id', user.id)
        .maybeSingle();

      if (isMounted) {
        setCurrentProfile(data || null);
      }
    };

    loadCurrentProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const isVideoUrl = (url: string) => {
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov');
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setSelectedMedia(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Media upload failed:', error);
      toast.error('Media upload failed. Please try again.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to your post');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const linkPreviews = detectedUrls.map(({ url }) => ({ url }));

      await createPost.mutateAsync({
        content: content.trim(),
        media_urls: selectedMedia,
        post_type: 'text',
        visibility: 'public',
        tags: [],
        link_previews: linkPreviews,
      });

      setContent('');
      setSelectedMedia([]);
      setHiddenPreviews(new Set());

      toast.success('Post shared successfully.');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to share post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setSelectedMedia(prev => prev.filter(url => url !== urlToRemove));
  };

  const hidePreview = (url: string) => {
    setHiddenPreviews(prev => new Set([...prev, url]));
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <div className="shrink-0" style={{ width: 40, height: 40 }}>
          <UserAvatar
            src={currentProfile?.profile_picture_url || null}
            userName={currentProfile?.full_name || 'You'}
            size="md"
          />
        </div>

        <div className="flex-1">
          <textarea
            rows={content.length > 80 ? 4 : 2}
            placeholder="Share your professional insights..."
            className="w-full resize-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
            style={{ fontSize: 15, lineHeight: '22px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>

      {visibleUrls.length > 0 && (
        <div className="px-4 pb-2 space-y-2">
          {visibleUrls.map(({ url }) => (
            <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-100">
              <LinkPreview url={url} compact />
              <button
                onClick={() => hidePreview(url)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Hide link preview"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedMedia.length > 0 && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
          {selectedMedia.map((url, index) => (
            <div key={url} className="relative group rounded-xl overflow-hidden bg-gray-50">
              {isVideoUrl(url) ? (
                <video
                  src={url}
                  controls
                  className="w-full bg-black object-cover"
                  style={{ maxHeight: 160 }}
                />
              ) : (
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full object-cover"
                  style={{ maxHeight: 160 }}
                />
              )}
              <button
                onClick={() => removeMedia(url)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove media"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="separator-thin mx-4" />

      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center">
          <label className="press-effect flex items-center gap-1.5 px-3 h-10 rounded-lg text-gray-500 cursor-pointer">
            <input type="file" multiple accept="image/*" onChange={handleMediaUpload} className="hidden" />
            <Image className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Photo</span>
          </label>

          <label className="press-effect flex items-center gap-1.5 px-3 h-10 rounded-lg text-gray-500 cursor-pointer">
            <input type="file" multiple accept="video/*" onChange={handleMediaUpload} className="hidden" />
            <Video className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Video</span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting || uploading}
          className="mr-2 px-5 h-8 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
          style={{
            fontSize: 14,
            background: content.trim() ? 'hsl(212,100%,48%)' : 'hsl(212,20%,70%)',
            boxShadow: content.trim() ? '0 2px 8px rgba(0,122,255,0.3)' : 'none',
          }}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};
