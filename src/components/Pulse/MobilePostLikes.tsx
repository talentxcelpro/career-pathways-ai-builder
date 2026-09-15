import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PostLike {
  user_id: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

interface MobilePostLikesProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const MobilePostLikes: React.FC<MobilePostLikesProps> = ({
  isOpen,
  onClose,
  postId
}) => {
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId]);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      
      // Fetch likes with user IDs
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('user_id, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (likesError) throw likesError;

      if (likesData && likesData.length > 0) {
        // Fetch profiles for all users who liked
        const userIds = likesData.map(like => like.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, title')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine likes with profile data
        const likesWithProfiles = likesData.map(like => ({
          ...like,
          profiles: profilesData?.find(p => p.id === like.user_id)
        }));

        setLikes(likesWithProfiles);
      } else {
        setLikes([]);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Likes {likes.length > 0 && `(${likes.length})`}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Likes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : likes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No likes yet</p>
              <p className="text-gray-400 text-xs mt-1">Be the first to like this post</p>
            </div>
          ) : (
            likes.map((like) => (
              <div
                key={`${like.user_id}-${like.created_at}`}
                onClick={() => handleUserClick(like.user_id)}
                className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                  <AvatarImage src={like.profiles?.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {like.profiles?.full_name || 'Unknown User'}
                  </h3>
                  {like.profiles?.title && (
                    <p className="text-xs text-gray-500 truncate">
                      {like.profiles.title}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
