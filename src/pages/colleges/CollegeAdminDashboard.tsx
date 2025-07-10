import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Users, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Plus,
  TrendingUp,
  Eye,
  Calendar,
  Award,
  FileText,
  Globe,
  Phone,
  Mail,
  MapPin,
  Edit,
  Upload,
  Bell,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch college admin data
  const { data: adminData } = useQuery({
    queryKey: ['college-admin', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('college_admins')
        .select(`
          *,
          colleges (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch college analytics
  const { data: analytics } = useQuery({
    queryKey: ['college-analytics', adminData?.college_id],
    queryFn: async () => {
      if (!adminData?.college_id) return null;
      
      const { data, error } = await supabase
        .from('college_analytics')
        .select('*')
        .eq('college_id', adminData.college_id)
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    },
    enabled: !!adminData?.college_id
  });

  // Fetch college posts
  const { data: posts } = useQuery({
    queryKey: ['college-posts', adminData?.college_id],
    queryFn: async () => {
      if (!adminData?.college_id) return [];
      
      const { data, error } = await supabase
        .from('college_posts')
        .select('*')
        .eq('college_id', adminData.college_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!adminData?.college_id
  });

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No College Access</h2>
            <p className="text-gray-600 mb-4">
              You don't have admin access to any college. Request access or create a new college profile.
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/colleges/create-request'}>
                Create College Profile
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/colleges'}>
                Browse Colleges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const college = adminData.colleges;
  const totalViews = analytics?.reduce((sum, day) => sum + (day.profile_views || 0), 0) || 0;
  const totalApplications = analytics?.reduce((sum, day) => sum + (day.application_starts || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
              <p className="text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share Profile
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-1" />
              New Post
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Profile Views', value: totalViews.toLocaleString(), icon: Eye, color: 'from-blue-500 to-cyan-500' },
            { label: 'Applications', value: totalApplications.toLocaleString(), icon: FileText, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Posts', value: posts?.length || 0, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
            { label: 'Verified', value: college.is_verified ? 'Yes' : 'Pending', icon: Award, color: 'from-yellow-500 to-orange-500' }
           ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Update College Info', icon: Edit, action: () => setActiveTab('profile') },
                    { label: 'Add New Course', icon: BookOpen, action: () => setActiveTab('courses') },
                    { label: 'Create Announcement', icon: MessageSquare, action: () => setActiveTab('posts') },
                    { label: 'Upload Media', icon: Upload, action: () => toast.info('Media upload coming soon') },
                    { label: 'View Analytics', icon: BarChart3, action: () => setActiveTab('analytics') }
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto hover:bg-blue-50"
                      onClick={action.action}
                    >
                      <action.icon className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-medium">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts?.slice(0, 5).map((post, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {post.post_type}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>College Profile</CardTitle>
                <CardDescription>
                  Manage your college's public information and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">College Name</label>
                      <p className="text-lg font-semibold text-gray-900">{college.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{college.city}, {college.state}</span>
                    </div>
                    
                    {college.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{college.email}</span>
                      </div>
                    )}
                    
                    {college.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{college.phone}</span>
                      </div>
                    )}
                    
                    {college.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a href={college.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {college.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={college.is_verified ? "default" : "secondary"}>
                          {college.is_verified ? "Verified" : "Pending Verification"}
                        </Badge>
                        <Badge variant={college.is_active ? "default" : "destructive"}>
                          {college.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Established</label>
                      <p className="text-gray-900">{college.established_year || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">College Type</label>
                      <p className="text-gray-900">{college.college_type || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Track your college's performance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    We're building comprehensive analytics including visitor trends, application patterns, and engagement metrics.
                  </p>
                  <Button variant="outline">
                    Request Beta Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-600">Course management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Posts & Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-600">Post management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeAdminDashboard;
