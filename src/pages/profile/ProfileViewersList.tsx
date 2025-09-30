import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function ProfileViewersList() {
  const { data: viewers, isLoading } = useQuery({
    queryKey: ['profile-viewers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          *,
          viewer:profiles!profile_views_viewer_id_fkey(
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .eq('profile_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

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
            {viewers?.length || 0} people have viewed your profile
          </p>
        </CardHeader>
        <CardContent>
          {!viewers || viewers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No profile views yet</p>
              <p className="text-sm mt-2">Share your profile to get more visibility!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {viewers.map((view: any) => (
                <Link
                  key={view.id}
                  to={`/profile/${view.viewer?.id}`}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={view.viewer?.profile_picture_url} />
                    <AvatarFallback>
                      {view.viewer?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {view.viewer?.full_name || 'Anonymous User'}
                        </p>
                        {view.viewer?.title && (
                          <p className="text-sm text-muted-foreground">
                            {view.viewer.title}
                            {view.viewer.current_company && ` at ${view.viewer.current_company}`}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                      </Badge>
                    </div>
                    
                    {view.source && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Viewed from: {view.source}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
