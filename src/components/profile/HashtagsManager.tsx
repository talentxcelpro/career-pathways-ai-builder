import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Plus, 
  X, 
  TrendingUp, 
  Search,
  Eye,
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hashtag {
  id: string;
  name: string;
  followed_at: string;
  post_count: number;
  trending?: boolean;
}

interface HashtagsManagerProps {
  userId: string;
}

export const HashtagsManager: React.FC<HashtagsManagerProps> = ({ userId }) => {
  const [newHashtag, setNewHashtag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: followedHashtags, isLoading } = useQuery({
    queryKey: ['followed-hashtags', userId],
    queryFn: async () => {
      // Mock data for now - in real app, fetch from user_hashtags table
      const mockHashtags: Hashtag[] = [
        {
          id: '1',
          name: 'reactjs',
          followed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          post_count: 1245,
          trending: true
        },
        {
          id: '2',
          name: 'webdevelopment',
          followed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          post_count: 892
        },
        {
          id: '3',
          name: 'javascript',
          followed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          post_count: 2156,
          trending: true
        },
        {
          id: '4',
          name: 'career',
          followed_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          post_count: 567
        },
        {
          id: '5',
          name: 'networking',
          followed_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          post_count: 234
        }
      ];
      return mockHashtags;
    }
  });

  const { data: trendingHashtags } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      // Mock trending hashtags
      return [
        { name: 'ai', post_count: 3421, growth: '+25%' },
        { name: 'remotework', post_count: 1876, growth: '+18%' },
        { name: 'startup', post_count: 1234, growth: '+15%' },
        { name: 'leadership', post_count: 987, growth: '+12%' },
        { name: 'innovation', post_count: 756, growth: '+10%' }
      ];
    }
  });

  const followHashtag = useMutation({
    mutationFn: async (hashtagName: string) => {
      // In real app, insert into user_hashtags table
      console.log('Following hashtag:', hashtagName);
    },
    onSuccess: (_, hashtagName) => {
      queryClient.invalidateQueries({ queryKey: ['followed-hashtags', userId] });
      toast.success(`Following #${hashtagName}`);
      setNewHashtag('');
    },
    onError: () => {
      toast.error('Failed to follow hashtag');
    }
  });

  const unfollowHashtag = useMutation({
    mutationFn: async (hashtagId: string) => {
      // In real app, delete from user_hashtags table
      console.log('Unfollowing hashtag:', hashtagId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-hashtags', userId] });
      toast.success('Hashtag unfollowed');
    },
    onError: () => {
      toast.error('Failed to unfollow hashtag');
    }
  });

  const handleAddHashtag = () => {
    const cleanHashtag = newHashtag.replace(/^#/, '').trim().toLowerCase();
    if (!cleanHashtag) {
      toast.error('Please enter a hashtag');
      return;
    }
    
    const isAlreadyFollowed = followedHashtags?.some(h => h.name.toLowerCase() === cleanHashtag);
    if (isAlreadyFollowed) {
      toast.error('You are already following this hashtag');
      return;
    }
    
    followHashtag.mutate(cleanHashtag);
  };

  const filteredHashtags = followedHashtags?.filter(hashtag =>
    hashtag.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatFollowedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Follow New Hashtag */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold">Follow Hashtags</h2>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter hashtag name..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
              />
            </div>
            <Button 
              onClick={handleAddHashtag} 
              disabled={followHashtag.isPending || !newHashtag.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Follow
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Follow hashtags to see related posts in your feed
          </p>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Trending Hashtags</h3>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-3">
            {trendingHashtags?.slice(0, 5).map((hashtag, index) => (
              <div key={hashtag.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{hashtag.name}</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                        {hashtag.growth}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hashtag.post_count.toLocaleString()} posts
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => followHashtag.mutate(hashtag.name)}
                  disabled={followedHashtags?.some(h => h.name === hashtag.name)}
                >
                  {followedHashtags?.some(h => h.name === hashtag.name) ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Followed Hashtags */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-lg font-semibold">Following</h3>
              <Badge variant="secondary">{followedHashtags?.length || 0}</Badge>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredHashtags.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium text-lg mb-2">
                {searchQuery ? 'No hashtags found' : 'No hashtags followed'}
              </h4>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Start following hashtags to see them here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHashtags.map(hashtag => (
                <div key={hashtag.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[hsl(var(--primary)/0.1)] rounded-lg">
                      <Hash className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{hashtag.name}</span>
                        {hashtag.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{hashtag.post_count.toLocaleString()} posts</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Followed {formatFollowedDate(hashtag.followed_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unfollowHashtag.mutate(hashtag.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};