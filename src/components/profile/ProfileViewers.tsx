import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, User } from "lucide-react";
import { Link } from 'react-router-dom';

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
        .select('id, full_name, title, profile_picture_url')
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
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
              {profileViewers.map((view) => (
                <div key={`${view.viewer_id}-${view.viewed_at}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={view.profiles?.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {view.profiles?.full_name 
                        ? view.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link 
                          to={`/network/profile/${view.viewer_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {view.profiles?.full_name || 'Unknown User'}
                        </Link>
                        {view.profiles?.title && (
                          <p className="text-sm text-gray-600 truncate">
                            {view.profiles.title}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(view.viewed_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}