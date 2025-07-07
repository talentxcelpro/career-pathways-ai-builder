import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Briefcase, 
  Users, 
  Megaphone,
  Trophy,
  Calendar,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface CompanyActivity {
  id: string;
  type: 'post' | 'job' | 'update' | 'milestone';
  title: string;
  content: string;
  created_at: string;
  company: {
    id: string;
    name: string;
    logo_url?: string;
    slug?: string;
  };
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    applications?: number;
  };
  tags?: string[];
}

export const CompanyNetworkActivity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'jobs' | 'updates'>('all');

  // Fetch company activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ['company-network-activity', activeTab],
    queryFn: async () => {
      // Get company posts
      const { data: companyPosts } = await supabase
        .from('company_posts')
        .select(`
          id,
          title,
          content,
          post_type,
          created_at,
          published_at,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          tags,
          companies (
            id,
            name,
            logo_url,
            slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      // Get recent jobs from companies
      const { data: companyJobs } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          created_at,
          applications_count,
          views_count,
          companies (
            id,
            name,
            logo_url,
            slug
          )
        `)
        .not('company_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      // Transform data into unified activities
      const activities: CompanyActivity[] = [];

      // Add company posts
      if (companyPosts) {
        companyPosts.forEach(post => {
          if (activeTab === 'all' || activeTab === 'posts') {
            activities.push({
              id: `post-${post.id}`,
              type: 'post',
              title: post.title,
              content: post.content,
              created_at: post.published_at || post.created_at,
              company: post.companies as any,
              metrics: {
                views: post.views_count,
                likes: post.likes_count,
                comments: post.comments_count,
                shares: post.shares_count
              },
              tags: post.tags
            });
          }
        });
      }

      // Add company jobs
      if (companyJobs) {
        companyJobs.forEach(job => {
          if (activeTab === 'all' || activeTab === 'jobs') {
            activities.push({
              id: `job-${job.id}`,
              type: 'job',
              title: job.title,
              content: job.description?.substring(0, 200) + '...' || '',
              created_at: job.created_at,
              company: job.companies as any,
              metrics: {
                views: job.views_count,
                applications: job.applications_count
              }
            });
          }
        });
      }

      // Sort by date
      return activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <Megaphone className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'update': return <TrendingUp className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Company Post';
      case 'job': return 'Job Opening';
      case 'update': return 'Company Update';
      case 'milestone': return 'Milestone';
      default: return 'Activity';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'job': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      case 'milestone': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent updates, posts, and company news from your network
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Activities List */}
        <div className="space-y-6">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={activity.company.logo_url} />
                    <AvatarFallback>
                      {activity.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            to={`/companies/${activity.company.slug || activity.company.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {activity.company.name}
                          </Link>
                          <Badge className={getActivityTypeColor(activity.type)}>
                            {getActivityIcon(activity.type)}
                            <span className="ml-1">{getActivityTypeLabel(activity.type)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 mb-2">{activity.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {activity.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {activity.tags && activity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {activity.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {activity.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Metrics */}
                    {activity.metrics && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {activity.metrics.views && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {activity.metrics.views}
                          </span>
                        )}
                        {activity.metrics.likes && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {activity.metrics.likes}
                          </span>
                        )}
                        {activity.metrics.comments && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {activity.metrics.comments}
                          </span>
                        )}
                        {activity.metrics.shares && (
                          <span className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            {activity.metrics.shares}
                          </span>
                        )}
                        {activity.metrics.applications && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {activity.metrics.applications} applications
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {activity.type === 'job' ? (
                        <Link to={`/jobs/${activity.id.replace('job-', '')}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            View Job
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/companies/${activity.company.slug || activity.company.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            View Post
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No company activity yet</h3>
              <p className="text-gray-600 mb-4">
                Follow companies to see their latest updates and job postings here
              </p>
              <Link to="/companies">
                <Button>
                  <Building className="h-4 w-4 mr-2" />
                  Browse Companies
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};