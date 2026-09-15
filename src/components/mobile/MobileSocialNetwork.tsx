import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Share2, Heart, Eye, Briefcase, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Connection {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  mutualConnections: number;
  status: 'connected' | 'pending' | 'suggested';
}

interface Post {
  id: string;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: 'job_update' | 'achievement' | 'article' | 'question';
}

export const MobileSocialNetwork = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'connections' | 'suggestions'>('feed');
  const { toast } = useToast();

  useEffect(() => {
    // Mock data
    const mockConnections: Connection[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Senior Frontend Developer',
        company: 'Google',
        avatar: '',
        mutualConnections: 12,
        status: 'connected'
      },
      {
        id: '2',
        name: 'Mike Chen',
        title: 'Product Manager',
        company: 'Meta',
        avatar: '',
        mutualConnections: 8,
        status: 'suggested'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        title: 'UX Designer',
        company: 'Apple',
        avatar: '',
        mutualConnections: 5,
        status: 'pending'
      }
    ];

    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          title: 'Senior Frontend Developer at Google',
          avatar: ''
        },
        content: 'Just completed my React certification! Excited to apply these new skills to upcoming projects. #ReactJS #WebDevelopment',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 24,
        comments: 8,
        shares: 3,
        isLiked: false,
        type: 'achievement'
      },
      {
        id: '2',
        author: {
          name: 'Mike Chen',
          title: 'Product Manager at Meta',
          avatar: ''
        },
        content: 'Looking for talented Frontend developers to join our team. We\'re building the next generation of social experiences. DM me for details!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 45,
        comments: 12,
        shares: 8,
        isLiked: true,
        type: 'job_update'
      }
    ];

    setConnections(mockConnections);
    setPosts(mockPosts);
  }, []);

  const handleConnect = (connectionId: string) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === connectionId
          ? { ...conn, status: conn.status === 'suggested' ? 'pending' : 'connected' }
          : conn
      )
    );
    
    toast({
      title: "Connection Request Sent",
      description: "Your request has been sent successfully",
    });
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'job_update': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'article': return <Eye className="h-4 w-4 text-purple-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Professional Network</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {['feed', 'connections', 'suggestions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{post.author.name}</h4>
                      {getPostIcon(post.type)}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.author.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(post.timestamp)}</p>
                  </div>
                </div>

                <p className="text-sm">{post.content}</p>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 text-sm ${
                        post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      {post.shares}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Your Connections</span>
            <Badge variant="outline">{connections.filter(c => c.status === 'connected').length}</Badge>
          </div>
          {connections.filter(c => c.status === 'connected').map((connection) => (
            <Card key={connection.id} className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={connection.avatar} />
                  <AvatarFallback>
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{connection.name}</h4>
                  <p className="text-xs text-muted-foreground">{connection.title}</p>
                  <p className="text-xs text-muted-foreground">{connection.company}</p>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">People You May Know</span>
            <Badge variant="outline">{connections.filter(c => c.status === 'suggested').length}</Badge>
          </div>
          {connections.filter(c => c.status === 'suggested').map((connection) => (
            <Card key={connection.id} className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={connection.avatar} />
                  <AvatarFallback>
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{connection.name}</h4>
                  <p className="text-xs text-muted-foreground">{connection.title}</p>
                  <p className="text-xs text-muted-foreground">{connection.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {connection.mutualConnections} mutual connections
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleConnect(connection.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};