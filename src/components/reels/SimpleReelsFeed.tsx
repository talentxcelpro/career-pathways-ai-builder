import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';

interface SimpleReelsFeedProps {
  onUploadClick: () => void;
}

export const SimpleReelsFeed: React.FC<SimpleReelsFeedProps> = ({ onUploadClick }) => {
  const { data: reels, isLoading, error } = useQuery({
    queryKey: ['simple-reels'],
    queryFn: async () => {
      // Try to get video posts first
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url
          )
        `)
        .eq('post_type', 'video')
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white text-center p-6">
          <Video className="h-16 w-16 text-gray-400" />
          <h3 className="text-xl font-semibold">Error Loading Reels</h3>
          <p className="text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!reels?.length) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-white text-center p-6">
          <Video className="h-24 w-24 text-gray-400" />
          <h3 className="text-2xl font-bold">No Reels Yet</h3>
          <p className="text-gray-300 max-w-sm">
            Be the first to create a professional reel and share your expertise
          </p>
          <Button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create First Reel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {reels.map((reel) => (
        <div key={reel.id} className="h-screen snap-start flex items-center justify-center p-4">
          <Card className="bg-gray-900 text-white max-w-sm w-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  {reel.profiles?.full_name?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {reel.profiles?.full_name || 'User'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(reel.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {reel.media_urls && reel.media_urls.length > 0 ? (
                <video 
                  src={reel.media_urls[0]} 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                  controls
                  playsInline
                />
              ) : (
                <div className="w-full h-64 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <p className="text-sm">{reel.content}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};