import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export const PostsDebugFeed: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // Standard query with caching disabled
  const { 
    data: posts, 
    error, 
    isLoading, 
    refetch,
    dataUpdatedAt 
  } = useQuery({
    queryKey: ['posts-debug'],
    queryFn: async () => {
      console.log('🔄 Fetching posts with cache disabled...');
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .neq('id', null) // Force fresh query
        .limit(10);
      
      if (error) {
        console.error('❌ Posts fetch error:', error);
        throw error;
      }
      
      console.log('✅ Posts fetched:', data?.length || 0, 'posts');
      
      // Log debug info
      setDebugInfo(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Query executed',
        count: data?.length || 0,
        success: true
      }].slice(-20)); // Keep last 20 entries
      
      return data || [];
    },
    refetchInterval: isPolling ? 3000 : false,
    staleTime: 0, // Always consider stale
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Manual polling toggle
  const togglePolling = () => {
    setIsPolling(!isPolling);
    if (!isPolling) {
      setDebugInfo(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Started polling',
        count: 0,
        success: true
      }]);
    } else {
      setDebugInfo(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Stopped polling',
        count: 0,
        success: true
      }]);
    }
  };

  // Manual refresh
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setDebugInfo(prev => [...prev, {
      timestamp: new Date().toISOString(),
      action: 'Manual refresh',
      count: 0,
      success: true
    }]);
    refetch();
  };

  // Test direct database access
  const testDirectDB = async () => {
    try {
      console.log('🔄 Testing direct database access...');
      
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setDebugInfo(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Direct DB test',
        count: data?.length || 0,
        success: !error,
        error: error?.message
      }]);
      
      if (error) {
        console.error('❌ Direct DB test failed:', error);
      } else {
        console.log('✅ Direct DB test passed:', data?.length, 'posts');
      }
    } catch (err) {
      console.error('❌ Direct DB test error:', err);
      setDebugInfo(prev => [...prev, {
        timestamp: new Date().toISOString(),
        action: 'Direct DB test',
        count: 0,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Posts Debug Feed</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={isPolling ? "destructive" : "default"}
                size="sm"
                onClick={togglePolling}
              >
                {isPolling ? 'Stop Polling' : 'Start Polling'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testDirectDB}
              >
                Test Direct DB
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Debug posts data fetching - Cache disabled, real-time monitoring
            {isPolling && (
              <Badge variant="outline" className="ml-2">
                Polling every 3s
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>Status:</span>
              {error ? (
                <Badge variant="destructive">Error</Badge>
              ) : isLoading ? (
                <Badge variant="secondary">Loading</Badge>
              ) : (
                <Badge variant="default">Ready</Badge>
              )}
            </div>
            <div>Posts Count: <strong>{posts?.length || 0}</strong></div>
            <div>Last Updated: <strong>{new Date(dataUpdatedAt).toLocaleTimeString()}</strong></div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
          )}

          {/* Posts List */}
          <div className="border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
              <h4 className="font-medium text-sm">Recent Posts</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {posts && posts.length > 0 ? (
                posts.map((post: any, index: number) => (
                  <div key={post.id || index} className="p-3 border-b last:border-b-0">
                    <p className="text-sm font-medium">{post.content || 'No content'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {post.id} | Created: {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No posts found</p>
                  <p className="text-xs mt-1">Try creating a post or refreshing the data</p>
                </div>
              )}
            </div>
          </div>

          {/* Debug Log */}
          <div className="border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
              <h4 className="font-medium text-sm">Debug Log</h4>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="p-2 border-b last:border-b-0 text-xs">
                  <div className="flex items-center gap-2">
                    {info.success ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    )}
                    <span className="font-medium">{info.action}</span>
                    <span className="text-gray-500">
                      {new Date(info.timestamp).toLocaleTimeString()}
                    </span>
                    {info.count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {info.count} items
                      </Badge>
                    )}
                  </div>
                  {info.error && (
                    <p className="text-red-600 mt-1">{info.error}</p>
                  )}
                </div>
              ))}
              {debugInfo.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-xs">
                  No debug events yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};