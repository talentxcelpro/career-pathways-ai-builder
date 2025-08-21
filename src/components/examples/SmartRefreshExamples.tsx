import React from 'react';
import { SmartJobsRefresh, SmartPostsRefresh, SmartApplicationsRefresh } from '@/components/smart/SmartDataRefresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Briefcase, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Example implementation showing how to use smart auto-refresh for jobs feed
 */
export const JobsFeedExample: React.FC = () => {
  return (
    <SmartJobsRefresh>
      {(jobs, loading, error) => {
        if (loading) return <div className="p-4">Loading jobs...</div>;
        if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest Jobs</h2>
              <Badge variant="outline" className="text-xs">
                Auto-refreshing every 2s
              </Badge>
            </div>
            {jobs?.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant="secondary">{job.job_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{job.company_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applications_count || 0} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }}
    </SmartJobsRefresh>
  );
};

/**
 * Example implementation showing how to use smart auto-refresh for posts feed
 */
export const PostsFeedExample: React.FC = () => {
  return (
    <SmartPostsRefresh>
      {(posts, loading, error) => {
        if (loading) return <div className="p-4">Loading posts...</div>;
        if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest Posts</h2>
              <Badge variant="outline" className="text-xs">
                Auto-refreshing every 2s
              </Badge>
            </div>
            {posts?.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{post.title || 'Untitled Post'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes_count || 0} likes
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }}
    </SmartPostsRefresh>
  );
};

/**
 * Example implementation showing how to use smart auto-refresh for applications
 */
export const ApplicationsFeedExample: React.FC = () => {
  return (
    <SmartApplicationsRefresh>
      {(applications, loading, error) => {
        if (loading) return <div className="p-4">Loading applications...</div>;
        if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Applications</h2>
              <Badge variant="outline" className="text-xs">
                Auto-refreshing every 3s
              </Badge>
            </div>
            {applications?.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{app.jobs?.title}</h3>
                      <p className="text-sm text-muted-foreground">{app.jobs?.company_name}</p>
                    </div>
                    <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {app.profiles?.full_name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }}
    </SmartApplicationsRefresh>
  );
};