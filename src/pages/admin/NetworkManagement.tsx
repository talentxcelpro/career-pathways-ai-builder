
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { NetworkFilters } from '@/components/admin/network/NetworkFilters';
import { TrendingTopics } from '@/components/admin/network/TrendingTopics';
import { EmojiConfigManagement } from '@/components/admin/network/EmojiConfigManagement';
import { RealtimeNetworkStats } from '@/components/admin/network/RealtimeNetworkStats';
import { BulkModerationPanel } from '@/components/admin/network/BulkModerationPanel';
import { EnhancedPostsList } from '@/components/admin/network/EnhancedPostsList';
import { useRealtimeNetworkManagement } from '@/hooks/useRealtimeNetworkManagement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { NetworkAutoPostControl } from '@/components/admin/NetworkAutoPostControl';

const NetworkManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    moderationFilter,
    setModerationFilter,
    selectedPosts,
    realTimeActivity,
    posts,
    networkStats,
    trendingTopics,
    isLoading,
    isBulkActionLoading,
    handleDeletePost,
    handleBulkAction,
    togglePostSelection,
    selectAllPosts,
    clearSelection
  } = useRealtimeNetworkManagement();

  return (
    <UnifiedAdminLayout 
      title="Network Management" 
      description="Real-time network monitoring, autonomous human posting engine, and content moderation"
    >
      <div className="space-y-8">
        {/* Autonomous Micro-Post Engine Cockpit */}
        <NetworkAutoPostControl />

        {/* Real-time Stats */}
        <RealtimeNetworkStats 
          networkStats={networkStats} 
          realTimeActivity={realTimeActivity}
        />
        
        {/* Filters and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <NetworkFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              posts={posts || []}
            />
          </div>
          <div>
            <Select value={moderationFilter} onValueChange={setModerationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Moderation Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    Pending Review
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Needs Action
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="flagged">
                  <div className="flex items-center gap-2">
                    Flagged Content
                    <Badge variant="destructive">Alert</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Moderation Panel */}
        <BulkModerationPanel
          selectedPosts={selectedPosts}
          onBulkAction={handleBulkAction}
          onClearSelection={clearSelection}
          isLoading={isBulkActionLoading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Posts List */}
          <div className="lg:col-span-2">
            <EnhancedPostsList
              posts={posts || []}
              isLoading={isLoading}
              selectedPosts={selectedPosts}
              onDeletePost={handleDeletePost}
              onToggleSelection={togglePostSelection}
              onSelectAll={selectAllPosts}
              onClearSelection={clearSelection}
            />
          </div>
          
          {/* Sidebar with Trending Topics and Tools */}
          <div className="space-y-6">
            <TrendingTopics trendingTopics={trendingTopics} />
            <EmojiConfigManagement />
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default NetworkManagement;
