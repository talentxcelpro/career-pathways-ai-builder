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
  const { toast } = useToast();

  // Real-time data hooks - these auto-update without refreshes!
  const { data: jobs, loading: jobsLoading, refresh: refreshJobs } = useRealtimeJobs({
    limit: 5,
    enableToasts: true
  });
  
  const { data: posts, loading: postsLoading, refresh: refreshPosts } = useRealtimePosts({
    limit: 5,
    enableToasts: true
  });
  
  const { data: colleges, loading: collegesLoading } = useRealtimeColleges({
    limit: 5
  });
  
  const { data: applications, loading: applicationsLoading } = useRealtimeApplications(undefined, {
    limit: 5
  });

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
              Jobs ({jobs.length})
              <Badge variant="default" className="ml-auto">Live</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshJobs} disabled={jobsLoading}>
              <RefreshCw className={`h-3 w-3 ${jobsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No jobs yet</p>
            ) : (
              jobs.map((job: any) => (
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
              Posts ({posts.length})
              <Badge variant="default" className="ml-auto">Live</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshPosts} disabled={postsLoading}>
              <RefreshCw className={`h-3 w-3 ${postsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {postsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No posts yet</p>
            ) : (
              posts.map((post: any) => (
                <div key={post.id} className="p-2 border rounded">
                  <div className="text-sm">{post.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {post.profiles?.full_name || 'Anonymous'} • {new Date(post.created_at).toLocaleTimeString()}
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
              Colleges ({colleges.length})
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {collegesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : colleges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No colleges yet</p>
            ) : (
              colleges.map((college: any) => (
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
              Applications ({applications.length})
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No applications yet</p>
            ) : (
              applications.map((app: any) => (
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