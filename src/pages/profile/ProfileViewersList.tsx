import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileViewersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const FREE_VIEWER_LIMIT = 5;

  const { data: viewers, isLoading } = useQuery({
    queryKey: ['profile-viewers', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Fetch profile views with optional viewer profiles
      const { data: viewsData, error } = await supabase
        .from('profile_views')
        .select(`
          id,
          viewer_id,
          viewed_at,
          view_type
        `)
        .eq('profile_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get unique viewer IDs (excluding nulls for anonymous views)
      const viewerIds = [...new Set(viewsData
        .map(view => view.viewer_id)
        .filter(Boolean) as string[])];

      // Fetch profiles for viewers
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, current_company')
        .in('id', viewerIds);

      // Group views by viewer_id and get the most recent view for each unique viewer
      const uniqueViewersMap = new Map();
      viewsData.forEach(view => {
        const key = view.viewer_id || `anonymous-${view.id}`;
        if (!uniqueViewersMap.has(key) || 
            new Date(view.viewed_at) > new Date(uniqueViewersMap.get(key).viewed_at)) {
          uniqueViewersMap.set(key, {
            ...view,
            profiles: view.viewer_id 
              ? profilesData?.find(p => p.id === view.viewer_id) || null
              : null
          });
        }
      });

      return Array.from(uniqueViewersMap.values()).sort((a, b) => 
        new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
      );
    },
    enabled: !!user
  });

  // Redirect if not authenticated - this page is private to the user only
  React.useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth/login');
    }
  }, [user, isLoading, navigate]);

  if (!user) {
    return null;
  }

  const totalViewers = viewers?.length || 0;
  const displayedViewers = viewers?.slice(0, FREE_VIEWER_LIMIT) || [];
  const hiddenViewersCount = Math.max(0, totalViewers - FREE_VIEWER_LIMIT);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Profile Viewers</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {totalViewers} {totalViewers === 1 ? 'person has' : 'people have'} viewed your profile
          </p>
        </CardHeader>
        <CardContent>
          {totalViewers === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No profile views yet</p>
              <p className="text-sm mt-2">Share your profile to get more visibility!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedViewers.map((view: any) => {
                  // Access the nested profiles object correctly
                  const viewerProfile = view.profiles;
                  const viewerId = view.viewer_id || viewerProfile?.id;
                  
                  return (
                <Link
                  key={view.id}
                  to={`/profile/${viewerId}`}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={viewerProfile?.profile_picture_url} />
                    <AvatarFallback>
                      {viewerProfile?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {viewerProfile?.full_name || 'Anonymous User'}
                        </p>
                        {viewerProfile?.title && (
                          <p className="text-sm text-muted-foreground">
                            {viewerProfile.title}
                            {viewerProfile.current_company && ` at ${viewerProfile.current_company}`}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                      </Badge>
                    </div>
                    
                    {view.view_type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        View type: {view.view_type}
                      </p>
                    )}
                  </div>
                </Link>
                  );
              })}
              </div>

              {/* Upgrade Prompt */}
              {hiddenViewersCount > 0 && (
                <Card className="mt-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6 text-center">
                    <Crown className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">
                      Unlock {hiddenViewersCount} More {hiddenViewersCount === 1 ? 'Viewer' : 'Viewers'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to Premium to see everyone who's viewed your profile and gain access to advanced analytics
                    </p>
                    <Button 
                      className="gap-2"
                      onClick={() => navigate('/pro/subscription')}
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
