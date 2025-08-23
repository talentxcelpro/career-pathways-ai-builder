import { supabase } from '@/integrations/supabase/client';

// Utility to fetch posts with profiles without using foreign key hints
export const fetchPostsWithProfiles = async (filters: {
  limit?: number;
  visibility?: string;
  feedType?: 'all' | 'smart' | 'following';
  userId?: string;
} = {}) => {
  const { limit = 50, visibility = 'public', feedType = 'all', userId } = filters;

  try {
    // First, fetch posts
    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('visibility', visibility)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // Apply feed type filters
    if (feedType === 'following' && userId) {
      // Get user's connections first
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      const followingIds = connections?.map(conn => 
        conn.requester_id === userId ? conn.recipient_id : conn.requester_id
      ).filter(Boolean) || [];

      if (followingIds.length > 0) {
        postsQuery = postsQuery.in('author_id', followingIds);
      } else {
        // If no connections, return empty array
        return [];
      }
    }

    postsQuery = postsQuery.limit(limit);

    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Get unique author IDs
    const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))];

    // Fetch profiles for all authors
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_picture_url, title, headline, current_company')
      .in('id', authorIds);

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

    // Combine posts with profiles
    const postsWithProfiles = posts.map(post => ({
      ...post,
      profiles: profilesMap.get(post.author_id) || {
        id: post.author_id,
        full_name: 'Professional User',
        profile_picture_url: null,
        title: null,
        headline: null,
        current_company: null
      }
    }));

    return postsWithProfiles;
  } catch (error) {
    console.error('Error fetching posts with profiles:', error);
    return [];
  }
};

// Utility to get user's liked posts
export const getUserLikedPosts = async (userId: string) => {
  if (!userId) return new Set();

  try {
    const { data: userLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);

    return new Set(userLikes?.map(like => like.post_id) || []);
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return new Set();
  }
};

// Utility to get post engagement stats
export const getPostEngagementStats = async (postIds: string[]) => {
  if (!postIds.length) return new Map();

  try {
    const [likesResult, commentsResult, sharesResult] = await Promise.all([
      supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds),
      supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds),
      supabase
        .from('post_shares')
        .select('post_id')
        .in('post_id', postIds)
    ]);

    const statsMap = new Map();

    // Count engagement for each post
    postIds.forEach(postId => {
      statsMap.set(postId, {
        likes: likesResult.data?.filter(like => like.post_id === postId).length || 0,
        comments: commentsResult.data?.filter(comment => comment.post_id === postId).length || 0,
        shares: sharesResult.data?.filter(share => share.post_id === postId).length || 0
      });
    });

    return statsMap;
  } catch (error) {
    console.error('Error fetching engagement stats:', error);
    return new Map();
  }
};