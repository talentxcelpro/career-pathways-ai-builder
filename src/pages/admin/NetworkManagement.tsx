
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { NetworkStatsCards } from '@/components/admin/network/NetworkStatsCards';
import { NetworkFilters } from '@/components/admin/network/NetworkFilters';
import { PostsList } from '@/components/admin/network/PostsList';
import { TrendingTopics } from '@/components/admin/network/TrendingTopics';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';

const NetworkManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    posts,
    networkStats,
    trendingTopics,
    isLoading,
    handleDeletePost
  } = useNetworkManagement();

  return (
    <UnifiedAdminLayout 
      title="Network Management" 
      description="Moderate posts, comments, and community content"
    >
      <div className="space-y-8">
        <NetworkStatsCards networkStats={networkStats} />
        
        <NetworkFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          posts={posts || []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PostsList
              posts={posts || []}
              isLoading={isLoading}
              onDeletePost={handleDeletePost}
            />
          </div>
          
          <div className="space-y-6">
            <TrendingTopics trendingTopics={trendingTopics} />
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default NetworkManagement;
