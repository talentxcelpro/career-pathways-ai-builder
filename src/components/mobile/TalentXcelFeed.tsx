import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from 'lucide-react';
import { MobileUserProfile } from './MobileUserProfile';

import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  isLiked?: boolean;
  profiles?: {
    id: string;
    full_name: string | null;
    profile_picture_url: string | null;
    title: string | null;
    current_company: string | null;
    location: string | null;
    about: string | null;
    skills: string[] | null;
    headline: string | null;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}


export const TalentXcelFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentlyLiked = !!post.isLiked;
        const currentLikes = getLikes(post);
        return {
          ...post,
          isLiked: !currentlyLiked,
          likes_count: currentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
        };
      })
    );
  };

  // Helpers to safely read post fields
  const getAuthorName = (post: Post) => post?.profiles?.full_name || 'Professional User';
  const getAvatar = (post: Post) => post?.profiles?.profile_picture_url || '';
  const getVerified = (post: Post) => Boolean(post?.profiles?.pro_status === 'active');
  const getContent = (post: Post) => post?.content || '';
  const getImage = (post: Post) => post?.media_urls?.[0] || undefined;
  const getTimestamp = (post: Post) => {
    try { 
      return post?.created_at ? new Date(post.created_at).toLocaleString() : ''; 
    } catch { 
      return ''; 
    }
  };
  const getLikes = (post: Post) => post?.likes_count ?? 0;
  const getComments = (post: Post) => post?.comments_count ?? 0;

  useEffect(() => {
    let channel: any;
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id),
          post_comments!left(id),
          post_shares!left(id),
          profiles!inner(
            id,
            full_name,
            profile_picture_url,
            title,
            current_company,
            location,
            about,
            skills,
            headline,
            pro_plan,
            pro_status,
            pro_expires_at
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error loading posts:', error);
        return;
      }
      
      // Transform data to include counts
      const transformedPosts = (data || []).map(post => ({
        ...post,
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        shares_count: post.post_shares?.length || 0,
        isLiked: false, // Initialize as not liked
      }));
      
      setPosts(transformedPosts);
    };
    fetchInitial();

    channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev: any[]) => {
          if (payload.eventType === 'INSERT') {
            return [payload.new, ...prev];
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((p) => p.id !== payload.old.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="pb-6">

      {/* Posts */}
      <div className="space-y-4 mt-4 px-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white border border-gray-200 shadow-sm">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center space-x-3">
              {post.profiles && (
                <MobileUserProfile
                  profile={post.profiles}
                  trigger={
                    <div className="flex items-center space-x-3 cursor-pointer">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getAvatar(post)} alt={getAuthorName(post)} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {getAuthorName(post).split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {getAuthorName(post)}
                          </span>
                          {getVerified(post) && (
                            <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{getTimestamp(post)}</span>
                      </div>
                    </div>
                  }
                />
              )}
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 text-sm leading-relaxed">
                {getContent(post)}
              </p>
            </div>

            {/* Post Image */}
            {getImage(post) && (
              <div className="mb-3">
                <img 
                  src={getImage(post) as string}
                  alt={`${getAuthorName(post)} post image`}
                  className="w-full aspect-video object-cover bg-gray-100"
                  loading="lazy"
                />
              </div>
            )}

            {/* Engagement Actions */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 p-0 h-auto ${post?.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-5 h-5 ${post?.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{getLikes(post)}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2 p-0 h-auto text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{getComments(post)}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-gray-600"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

      </div>
    </div>
  );
};