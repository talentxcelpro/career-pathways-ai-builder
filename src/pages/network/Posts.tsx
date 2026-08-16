import React from 'react';
import { EnhancedNetworkPostsFeed } from "@/components/network/EnhancedNetworkPostsFeed";

interface PostsProps {
  feedType?: 'all' | 'connections' | 'trending';
}

const Posts: React.FC<PostsProps> = ({ feedType = 'all' }) => {
  return (
    <div className="w-full space-y-6">
      <EnhancedNetworkPostsFeed feedType={feedType} />
    </div>
  );
};

export default Posts;