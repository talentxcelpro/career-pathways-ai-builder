import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Priya Desai',
      avatar: '/lovable-uploads/6eb9029c-11ba-4d79-ab79-e4450decd781.png',
      verified: true
    },
    content: 'I got the offer! 🎉',
    image: '/lovable-uploads/6eb9029c-11ba-4d79-ab79-e4450decd781.png',
    timestamp: '5h ago',
    likes: 280,
    comments: 32,
    isLiked: false
  }
];

export const TalentXcelFeed: React.FC = () => {
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="pb-6">
      {/* News Banner */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="text-sm">
            <span className="font-semibold text-gray-900">Global Career News</span>
            <span className="text-gray-600 ml-2">5 Tips to Negotiate Salary...</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4 mt-4 px-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white border border-gray-200 shadow-sm">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {post.author.name}
                    </span>
                    {post.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{post.timestamp}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 text-sm leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="mb-3">
                <img 
                  src={post.image}
                  alt="Post content" 
                  className="w-full aspect-video object-cover bg-gray-100"
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
                    className={`flex items-center space-x-2 p-0 h-auto ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2 p-0 h-auto text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
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

        {/* Additional Posts */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">YC</span>
                </div>
              </Avatar>
              <div>
                <span className="font-semibold text-gray-900 text-sm">YourCareer</span>
                <div className="text-xs text-gray-500">3h ago</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-4 pb-3">
            <p className="text-gray-900 text-sm leading-relaxed">
              5 Tips to Negotiate Salary
            </p>
          </div>

          <div className="mb-3">
            <img 
              src="/lovable-uploads/6eb9029c-11ba-4d79-ab79-e4450decd781.png"
              alt="Career tips content" 
              className="w-full aspect-video object-cover bg-gray-100"
            />
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-0 h-auto text-gray-600">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">156</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-0 h-auto text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">23</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};