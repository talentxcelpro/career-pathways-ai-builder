import React from 'react';
import { EnhancedNetworkPostsFeed } from "@/components/network/EnhancedNetworkPostsFeed";

interface PostsProps {
  feedType?: 'all' | 'connections' | 'trending';
  searchTerm?: string;
}

const Posts: React.FC<PostsProps> = ({ feedType = 'all', searchTerm }) => {
  return (
    <div className="w-full space-y-6">
      <EnhancedNetworkPostsFeed feedType={feedType} searchTerm={searchTerm} />
    </div>
  );
};

export default Posts;
