import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  useRealtimeJobs,
  useRealtimePosts,
  useRealtimeColleges,
  useRealtimeApplications
} from '@/hooks/useRealtimeTable';
import { 
  useAutoRefreshJobs,
  useAutoRefreshPosts,
  useAutoRefreshCompanies,
  useAutoRefreshApplications
} from '@/hooks/useAutoRefresh';
import { supabase } from '@/integrations/supabase/client';
import { 
  Briefcase, 
  MessageSquare, 
  GraduationCap, 
  FileText,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const ProductionRealtimeDemo: React.FC = () => {
  const [testJobTitle, setTestJobTitle] = useState('');
  const [testPostContent, setTestPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const { toast } = useToast();

  // Real-time data hooks - these auto-update without refreshes!
  const realtimeJobs = useRealtimeJobs({
    limit: 5,
    enableToasts: true
  });
  
  const realtimePosts = useRealtimePosts({
    limit: 5,
    enableToasts: true
  });
  
  const realtimeColleges = useRealtimeColleges({
    limit: 5
  });
  
  const realtimeApplications = useRealtimeApplications(undefined, {
    limit: 5
  });

  // Auto-refresh polling fallback (every 2 seconds)
  const pollingJobs = useAutoRefreshJobs({ 
    enabled: usePolling,
    interval: 2000 
  });
  
  const pollingPosts = useAutoRefreshPosts({ 
    enabled: usePolling,
    interval: 2000 
  });
  
  const pollingCompanies = useAutoRefreshCompanies({ 
    enabled: usePolling,
    interval: 2000 
  });
  
  const pollingApplications = useAutoRefreshApplications({ 
    enabled: usePolling,
    interval: 2000 
  });

  // Choose data source based on mode
  const jobs = usePolling ? pollingJobs : realtimeJobs;
  const posts = usePolling ? pollingPosts : realtimePosts;
  const companies = usePolling ? { data: pollingCompanies.data || [], loading: pollingCompanies.loading, refresh: pollingCompanies.refresh } : { data: [], loading: false, refresh: () => {} };
  const colleges = usePolling ? { data: [], loading: false, refresh: () => {} } : realtimeColleges;
  const applications = usePolling ? pollingApplications : realtimeApplications;

  const createTestJob = async () => {
    if (!testJobTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([
          {
            title: testJobTitle,
            company_name: 'TalentXcel Demo',
            location: 'Remote',
            job_type: 'full_time',
            description: `Test job created at ${new Date().toLocaleTimeString()}`,
            requirements: ['Real-time testing experience'],
            salary_min: 50000,
            salary_max: 80000,
            is_active: true
          }
        ]);

      if (error) throw error;

      setTestJobTitle('');
      toast({
        title: "Success!",
        description: "Test job created - watch it appear instantly!",
      });
    } catch (error: any) {
      console.error('Error creating test job:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestPost = async () => {
    if (!testPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: testPostContent,
            post_type: 'text',
            visibility: 'public'
          }
        ]);

      if (error) throw error;

      setTestPostContent('');
      toast({
        title: "Success!",
        description: "Test post created - watch it appear instantly!",
      });
    } catch (error: any) {
      console.error('Error creating test post:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Production Real-time Demo
          </CardTitle>
          <CardDescription>
            Live data that auto-updates without page refreshes. Create test records and watch them appear instantly!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Data Update Mode</h3>
              <p className="text-sm text-muted-foreground">
                {usePolling ? 'Auto-refresh polling (every 2s)' : 'Supabase Realtime (instant)'}
              </p>
            </div>
            <Button
              variant={usePolling ? "secondary" : "default"}
              onClick={() => setUsePolling(!usePolling)}
              size="sm"
            >
              {usePolling ? 'Switch to Realtime' : 'Switch to Polling'}
            </Button>
          </div>

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Create Test Job</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter job title..."
                  value={testJobTitle}
                  onChange={(e) => setTestJobTitle(e.target.value)}
                />
                <Button 
                  onClick={createTestJob} 
                  disabled={isCreating}
                  size="sm"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Create Test Post</label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Enter post content..."
                  value={testPostContent}
                  onChange={(e) => setTestPostContent(e.target.value)}
                  className="min-h-[40px]"
                />
                <Button 
                  onClick={createTestPost} 
                  disabled={isCreating}
                  size="sm"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Jobs Real-time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({jobs.data?.length || 0})
              <Badge variant={usePolling ? "secondary" : "default"} className="ml-auto">
                {usePolling ? 'Polling' : 'Live'}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={jobs.refresh} disabled={jobs.loading}>
              <RefreshCw className={`h-3 w-3 ${jobs.loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : !jobs.data || jobs.data.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No jobs yet</p>
            ) : (
              jobs.data.map((job: any) => (
                <div key={job.id} className="p-2 border rounded">
                  <div className="font-medium text-sm">{job.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {job.company_name} • {job.location}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Posts Real-time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts ({posts.data?.length || 0})
              <Badge variant={usePolling ? "secondary" : "default"} className="ml-auto">
                {usePolling ? 'Polling' : 'Live'}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={posts.refresh} disabled={posts.loading}>
              <RefreshCw className={`h-3 w-3 ${posts.loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {posts.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : !posts.data || posts.data.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No posts yet</p>
            ) : (
              posts.data.map((post: any) => (
                <div key={post.id} className="p-2 border rounded">
                  <div className="text-sm">{post.content?.substring(0, 100)}...</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Colleges Real-time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Colleges ({colleges.data?.length || 0})
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {colleges.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : !colleges.data || colleges.data.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No colleges yet</p>
            ) : (
              colleges.data.map((college: any) => (
                <div key={college.id} className="p-2 border rounded">
                  <div className="font-medium text-sm">{college.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {college.location} • {college.type}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Applications Real-time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications ({applications.data?.length || 0})
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applications.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : !applications.data || applications.data.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No applications yet</p>
            ) : (
              applications.data.map((app: any) => (
                <div key={app.id} className="p-2 border rounded">
                  <div className="font-medium text-sm">{app.jobs?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.profiles?.full_name} • {app.status}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">✨ No Page Refreshes Needed!</h3>
            <p className="text-sm text-muted-foreground">
              This data updates automatically when changes happen in the database.
              Try opening another tab and creating records - they'll appear here instantly!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};