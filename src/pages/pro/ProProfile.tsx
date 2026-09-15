import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { 
  Crown, 
  Star, 
  MapPin, 
  Calendar,
  Award,
  Briefcase,
  Users,
  TrendingUp,
  Settings,
  Edit,
  Save,
  X,
  MessageSquare
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  about: string | null;
  created_at: string;
  skills: string[];
  pro_status: string | null;
}

interface ProService {
  id: string;
  title: string;
  category: string;
  base_price: number;
  is_active: boolean;
}

interface UserActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export const ProProfile = () => {
  const { toast } = useToast();
  const { tier, isActive } = useFeatureGating();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<ProService[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [editForm, setEditForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        const userProfile: UserProfile = {
          id: profileData.id,
          full_name: profileData.full_name,
          title: profileData.title,
          bio: profileData.about,
          location: profileData.location,
          avatar_url: profileData.profile_picture_url || "/placeholder.svg",
          about: profileData.about,
          created_at: profileData.created_at,
          skills: Array.isArray(profileData.skills) ? profileData.skills : [],
          pro_status: profileData.pro_status
        };
        setProfile(userProfile);
        setEditForm({
          full_name: profileData.full_name || '',
          title: profileData.title || '',
          bio: profileData.about || '',
          location: profileData.location || ''
        });
      }

      // Load user's services - simplified approach  
      setServices([]);

      // Load recent activities (mock data for now)
      const mockActivities = [
        {
          id: '1',
          type: 'service_inquiry',
          description: 'Received new inquiry for Web Development service',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          type: 'service_completed',
          description: 'Completed Logo Design project',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'profile_view',
          description: 'Your profile was viewed 15 times today',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setActivities(mockActivities);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          title: editForm.title,
          about: editForm.bio,
          location: editForm.location
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        full_name: editForm.full_name,
        title: editForm.title,
        bio: editForm.bio,
        location: editForm.location
      } : null);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error", 
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pro Profile</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || 'Professional'}
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          {tier} Member
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.jpg"} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Full Name"
                          className="text-xl font-bold"
                        />
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Professional Title"
                        />
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">{profile?.full_name || 'Your Name'}</h2>
                        <p className="text-muted-foreground">{profile?.title || 'Professional'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile?.location || 'Location'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell people about yourself, your experience, and what makes you unique..."
                  rows={4}
                  className="mb-4"
                />
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  {profile?.bio || 'Share your professional story, experience, and what makes you unique. This helps clients understand your expertise and approach.'}
                </p>
              )}
              
              {/* Services Preview */}
              {services.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Your Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map(service => (
                      <div key={service.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm">{service.title}</h5>
                            <p className="text-xs text-muted-foreground">{service.category}</p>
                          </div>
                          <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                            ₹{service.base_price?.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pro Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Features & Benefits
              </CardTitle>
              <CardDescription>Your active Pro subscription benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">24/7 dedicated support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Detailed insights & reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Enhanced Networking</h4>
                    <p className="text-sm text-muted-foreground">Connect with Pro members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <Award className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">AI Tools Access</h4>
                    <p className="text-sm text-muted-foreground">Premium AI features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {activity.type === 'service_inquiry' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'service_completed' && <Award className="h-5 w-5 text-green-500" />}
                    {activity.type === 'profile_view' && <Users className="h-5 w-5 text-purple-500" />}
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity. Start by creating your first service!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pro Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Pro Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Views</span>
                <Badge variant="outline">+245%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Job Matches</span>
                <Badge variant="outline">89</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Connections</span>
                <Badge variant="outline">156</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Credits Used</span>
                <Badge variant="outline">47/100</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Plan</span>
                <Badge className="bg-purple-500">{tier}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Services</span>
                <span className="text-sm font-medium">{services.length} Active</span>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { 
                  month: 'long', 
                  year: 'numeric' 
                }) : 'Recently'}
              </p>
              <p className="text-sm text-muted-foreground">
                Member since {profile?.created_at ? 
                  (() => {
                    const monthsAgo = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
                    return monthsAgo > 0 ? `${monthsAgo} months` : 'recently';
                  })() : 'unknown'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};