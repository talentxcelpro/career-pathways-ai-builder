import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, User, Clock, EyeOff } from "lucide-react";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ProfileViewersProps {
  profileUserId: string;
  viewsCount: number;
}

export function ProfileViewers({ profileUserId, viewsCount }: ProfileViewersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: profileViewers = [], isLoading } = useQuery({
    queryKey: ['profile-viewers', profileUserId],
    queryFn: async () => {
      // First get the profile views
      const { data: views, error: viewsError } = await supabase
        .from('profile_views')
        .select('viewed_at, viewer_id')
        .eq('profile_id', profileUserId)
        .not('viewer_id', 'is', null)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (viewsError) throw viewsError;
      if (!views || views.length === 0) return [];

      // Get unique viewer IDs
      const viewerIds = [...new Set(views.map(v => v.viewer_id))];

      // Get profiles for these viewers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, is_viewing_private')
        .in('id', viewerIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return views.map(view => ({
        ...view,
        profiles: profilesMap.get(view.viewer_id)
      }));
    },
    enabled: !!profileUserId && isOpen,
  });

  const getDisplayName = (profile: any) => {
    if (!profile || profile.is_viewing_private) return "Anonymous Viewer";
    return profile.full_name || "Professional User";
  };

  const getInitials = (profile: any) => {
    if (!profile || profile.is_viewing_private) return "?";
    const name = profile.full_name || "Professional User";
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarUrl = (profile: any) => {
    if (!profile || profile.is_viewing_private) return null;
    return profile.profile_picture_url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto">
          <Eye className="h-4 w-4 mr-1" />
          {viewsCount} views
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Views ({viewsCount})
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[500px]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : profileViewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No profile views yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profileViewers.map((view) => {
                const profile = view.profiles;
                const isAnonymous = !profile || profile.is_viewing_private;
                
                return (
                  <div key={`${view.viewer_id}-${view.viewed_at}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getAvatarUrl(profile) || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                        {getInitials(profile)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isAnonymous ? (
                          <span className="text-sm font-medium text-muted-foreground">
                            Anonymous Viewer
                          </span>
                        ) : (
                          <Link 
                            to={`/network/people/${view.viewer_id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {getDisplayName(profile)}
                          </Link>
                        )}
                        {isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="h-2 w-2 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {!isAnonymous && profile?.title 
                            ? profile.title 
                            : "Professional"
                          }
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}