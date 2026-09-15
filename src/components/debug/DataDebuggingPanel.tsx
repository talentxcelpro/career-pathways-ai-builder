import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database, Network, AlertCircle, CheckCircle, Bug, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export const DataDebuggingPanel: React.FC = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [customSql, setCustomSql] = useState('SELECT id, content, created_at FROM posts ORDER BY created_at DESC LIMIT 5');
  const consoleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Test 1: Disable caching on fetches
  const testUncachedFetch = async () => {
    try {
      console.log('🔄 Testing uncached fetch...');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Force fresh query with limit
      
      const result = {
        test: 'Uncached Fetch',
        success: !error,
        data: data?.slice(0, 3),
        error: error?.message,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev]);
      
      if (error) {
        console.error('❌ Uncached fetch failed:', error);
      } else {
        console.log('✅ Uncached fetch successful:', data?.length, 'posts');
      }
    } catch (err) {
      console.error('❌ Uncached fetch error:', err);
    }
  };

  // Test 2: Check database directly
  const testDirectDatabase = async () => {
    try {
      console.log('🔄 Testing direct database query...');
      const { data, error } = await supabase
        .rpc('get_recent_posts', { limit_count: 5 });
      
      if (error) {
        // Fallback to regular query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('id, content, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const result = {
          test: 'Direct Database (Fallback)',
          success: !fallbackError,
          data: fallbackData,
          error: fallbackError?.message,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [result, ...prev]);
      } else {
        const result = {
          test: 'Direct Database (RPC)',
          success: true,
          data: data,
          error: null,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [result, ...prev]);
      }
    } catch (err) {
      console.error('❌ Direct database test error:', err);
    }
  };

  // Test 3: Start polling
  const startPolling = () => {
    if (isPolling) {
      // Stop polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      if (consoleIntervalRef.current) {
        clearInterval(consoleIntervalRef.current);
        consoleIntervalRef.current = null;
      }
      setIsPolling(false);
      console.log('⏹️ Stopped polling');
    } else {
      // Start polling
      console.log('▶️ Starting polling every 3 seconds...');
      
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from('posts')
          .select('id, content, created_at')
          .order('created_at', { ascending: false });
        console.log("📊 Polling Posts:", data?.length || 0, 'posts');
      }, 3000);
      
      // Also test console polling
      consoleIntervalRef.current = setInterval(async () => {
        let { data } = await supabase
          .from('posts')
          .select('id, content, created_at')
          .order('created_at', { ascending: false });
        console.log("🔄 Console Polling - Posts:", data);
      }, 3000);
      
      setPollingInterval(interval);
      setIsPolling(true);
    }
  };

  // Test 4: Execute custom SQL
  const executeCustomSql = async () => {
    try {
      console.log('🔄 Executing custom SQL...');
      
      // For simple SELECT queries, we can use the regular query
      if (customSql.trim().toLowerCase().startsWith('select')) {
        const tableName = customSql.match(/from\s+(\w+)/i)?.[1];
        if (tableName) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          
          setSqlResult({
            success: !error,
            data: data,
            error: error?.message,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setSqlResult({
          success: false,
          data: null,
          error: 'Only SELECT queries are supported in this interface',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('❌ SQL execution error:', err);
      setSqlResult({
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Test 5: Force refresh posts feed
  const refreshPostsFeed = async () => {
    try {
      console.log('🔄 Force refreshing posts feed...');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error fetching posts:", error);
        toast.error('Failed to refresh posts feed');
        return;
      }

      // Find posts container and update it
      const postsContainer = document.getElementById("posts-feed");
      if (postsContainer) {
        postsContainer.innerHTML = "";
        
        data?.forEach(post => {
          const div = document.createElement("div");
          div.className = "post-item p-4 border rounded-lg mb-2";
          div.innerHTML = `
            <p class="font-medium">${post.content || 'No content'}</p>
            <small class="text-gray-500">${new Date(post.created_at).toLocaleString()}</small>
          `;
          postsContainer.appendChild(div);
        });
        
        console.log('✅ Posts feed refreshed:', data?.length, 'posts');
        toast.success(`Posts feed refreshed: ${data?.length} posts`);
      } else {
        console.log('⚠️ No posts-feed container found');
        toast.warning('Posts feed container not found on this page');
      }
    } catch (err) {
      console.error('❌ Force refresh error:', err);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSqlResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Data Debugging Panel
          </CardTitle>
          <CardDescription>
            Debug data fetching, caching, and real-time issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" onClick={testUncachedFetch} className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Test Uncached
            </Button>
            <Button variant="outline" onClick={testDirectDatabase} className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Test Direct DB
            </Button>
            <Button 
              variant={isPolling ? "destructive" : "outline"} 
              onClick={startPolling} 
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isPolling ? 'animate-spin' : ''}`} />
              {isPolling ? 'Stop Poll' : 'Start Poll'}
            </Button>
            <Button variant="outline" onClick={refreshPostsFeed} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Feed
            </Button>
            <Button variant="outline" onClick={clearResults} className="text-xs">
              Clear Results
            </Button>
          </div>

          {/* Custom SQL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom SQL Query:</label>
            <Textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              placeholder="SELECT id, content, created_at FROM posts ORDER BY created_at DESC LIMIT 5"
              className="font-mono text-sm"
              rows={3}
            />
            <Button onClick={executeCustomSql} size="sm">
              <Terminal className="h-3 w-3 mr-1" />
              Execute
            </Button>
          </div>

          {/* SQL Result */}
          {sqlResult && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {sqlResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium text-sm">SQL Result</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(sqlResult.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
              {sqlResult.error ? (
                <p className="text-red-600 text-sm">{sqlResult.error}</p>
              ) : (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(sqlResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium text-sm">{result.test}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  {result.error ? (
                    <p className="text-red-600 text-sm">{result.error}</p>
                  ) : (
                    <p className="text-green-600 text-sm">
                      Success: {Array.isArray(result.data) ? result.data.length : 'N/A'} records
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Posts Feed Container */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Posts Feed (for testing):</h4>
            <div 
              id="posts-feed" 
              className="border rounded-lg p-4 min-h-32 bg-gray-50 max-h-64 overflow-y-auto"
            >
              <p className="text-gray-500 text-sm">Click "Refresh Feed" to populate this area</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};