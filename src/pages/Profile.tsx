
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  Building, 
  MapPin, 
  Users, 
  Briefcase, 
  Bookmark, 
  Calendar, 
  Newspaper, 
  UserCheck,
  Edit,
  ExternalLink
} from 'lucide-react';
import { incrementProfileView } from '@/utils/profileHelpers';
import { useState } from 'react';

const Profile = () => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Track profile view (for analytics)
  useEffect(() => {
    if (currentUser?.id && profile) {
      incrementProfileView(currentUser.id);
    }
  }, [currentUser?.id, profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Banner Section */}
        <div className="h-[300px] bg-gradient-to-r from-[hsl(213,63%,27%)] to-[hsl(210,64%,41%)] rounded-t-xl relative overflow-hidden shadow-lg">
          {profile?.banner_url && (
            <img
              src={profile.banner_url}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
        
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-24 px-8 pb-8 relative z-10">
          {/* Profile Picture */}
          <div className="w-[180px] h-[180px] rounded-full border-4 border-white shadow-xl bg-[hsl(var(--primary))] flex items-center justify-center text-white font-bold text-6xl mb-6 lg:mb-0">
            {profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={formatDisplayName(profile)}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              generateInitials(profile)
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 lg:ml-8 lg:pt-16 text-center lg:text-left">
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] inline-block">
                {formatDisplayName(profile)}
              </h1>
              <Badge variant="secondary" className="ml-3 px-3 py-1">
                He/Him
              </Badge>
            </div>
            
            {profile?.title && (
              <p className="text-xl text-[hsl(var(--muted-foreground))] font-medium mb-4">
                {profile.title}
              </p>
            )}
            
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-6 text-[hsl(var(--muted-foreground))]">
              {profile?.current_company && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                  <span>{profile.current_company}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                <Badge className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-3 py-1">
                  500+
                </Badge>
                <span className="ml-1">connections</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                <span>Open to opportunities</span>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button 
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white"
                onClick={() => navigate('/profile/edit')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add profile section
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View my services
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Resources */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-xl font-semibold">Resources</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-[hsl(var(--muted))] rounded-lg border-l-4 border-[hsl(var(--primary))]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">Open to work</h3>
                      <Button variant="ghost" className="text-[hsl(var(--primary))] p-0 h-auto">
                        Show details
                      </Button>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Vice President, Director of Operations, Director of Partnerships, Vice President of Sales and Country Manager roles
                    </p>
                  </div>
                  
                  <div className="p-5 bg-[hsl(var(--muted))] rounded-lg border-l-4 border-[hsl(var(--primary))]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">Hiring: Service Desk Engineer</h3>
                      <Button variant="ghost" className="text-[hsl(var(--primary))] p-0 h-auto">
                        Show job
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                        Savantis Solutions
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                        Noida, Uttar Pradesh, India (On-site)
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                        66 days ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity & Insights */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-xl font-semibold">Activity & Insights</h2>
                  <Button variant="ghost" className="text-[hsl(var(--primary))] p-0 h-auto">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[hsl(var(--muted))] rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-[hsl(var(--primary))] mb-1">
                      {profile?.profile_views_count || 644}
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Profile viewers</div>
                  </div>
                  
                  <div className="p-5 bg-[hsl(var(--muted))] rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-orange-600 mb-1">198</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Post impressions</div>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg text-center hover:shadow-md transition-shadow col-span-2">
                    <div className="text-3xl font-bold text-yellow-700 mb-1">5</div>
                    <div className="text-sm text-yellow-600">Your Premium features</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg cursor-pointer hover:bg-[hsl(var(--muted)/0.8)] transition-colors">
                    <Bookmark className="h-6 w-6 text-[hsl(var(--primary))] mb-2" />
                    <h3 className="font-medium text-sm">Saved items</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Your bookmarked content</p>
                  </div>
                  
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg cursor-pointer hover:bg-[hsl(var(--muted)/0.8)] transition-colors">
                    <UserCheck className="h-6 w-6 text-[hsl(var(--primary))] mb-2" />
                    <h3 className="font-medium text-sm">Groups</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Join professional groups</p>
                  </div>
                  
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg cursor-pointer hover:bg-[hsl(var(--muted)/0.8)] transition-colors">
                    <Newspaper className="h-6 w-6 text-[hsl(var(--primary))] mb-2" />
                    <h3 className="font-medium text-sm">Newsletters</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Subscribe to updates</p>
                  </div>
                  
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg cursor-pointer hover:bg-[hsl(var(--muted)/0.8)] transition-colors">
                    <Calendar className="h-6 w-6 text-[hsl(var(--primary))] mb-2" />
                    <h3 className="font-medium text-sm">Events</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Find upcoming events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
