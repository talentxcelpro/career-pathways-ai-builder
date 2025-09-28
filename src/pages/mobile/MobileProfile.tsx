import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  FileText,
  Settings,
  ExternalLink,
  Calendar,
  Building,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';

export const MobileProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user's applications
  const { data: applications = [] } = useQuery({
    queryKey: ['mobile-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs!job_id(
            title,
            company_name,
            location,
            employment_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch user's certifications
  const { data: certifications = [] } = useQuery({
    queryKey: ['mobile-certifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('date_earned', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch user's posts
  const { data: posts = [] } = useQuery({
    queryKey: ['mobile-user-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes:post_likes(count),
          comments:post_comments(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MobileNavWrapper>
      <ScrollArea className="h-[calc(100vh-80px)] ios-scroll">
        <div className="px-4 py-4 space-y-4 pb-20 native-app-style safe-area-top">
          {/* Profile Header */}
          <div className="native-card p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                {(profile?.display_name || profile?.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900">{profile?.display_name || 'User'}</h1>
            <p className="text-sm text-gray-600 mt-1">{profile?.email}</p>
            <p className="text-sm text-gray-500 mt-2">{profile?.bio || 'Add a bio to tell others about yourself'}</p>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => navigate('/profile?edit=true')}
                className="touch-feedback"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/profile?tab=settings')}
                className="touch-feedback"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="native-card p-4 text-center touch-feedback" onClick={() => navigate('/jobs')}>
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Find Jobs</p>
            </div>
            <div className="native-card p-4 text-center touch-feedback" onClick={() => navigate('/network')}>
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Network</p>
            </div>
          </div>

          {/* Stats */}
          <div className="native-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Activity</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">24</div>
                <div className="text-xs text-gray-600">Connections</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">12</div>
                <div className="text-xs text-gray-600">Posts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">156</div>
                <div className="text-xs text-gray-600">Profile Views</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="native-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New connection request</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Someone liked your post</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Job recommendation</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </MobileNavWrapper>
  );
};