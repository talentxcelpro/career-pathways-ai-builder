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
import { MobileLayout } from '@/components/mobile/MobileLayout';

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
    <MobileLayout>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="px-4 py-4 space-y-4 pb-20">
          {/* Profile Header */}
          <Card className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
            <CardContent className="p-6 -mt-12">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
                  <AvatarImage src={profile.profile_photo_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.full_name}
                </h1>
                
                {profile.headline && (
                  <p className="text-gray-600 font-medium mb-2">{profile.headline}</p>
                )}
                
                
                {profile.location && (
                  <div className="flex items-center gap-1 text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl border-gray-200"
                    onClick={() => navigate('/mobile/qr-code')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share QR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-600">Connections</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <FileText className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-xs text-gray-600">Posts</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
                <p className="text-xs text-gray-600">Certificates</p>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          {profile.about && (
            <Card className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{profile.about}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabbed Content */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100/80 backdrop-blur-sm">
              <TabsTrigger value="activity" className="rounded-xl">Activity</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl">Jobs</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl">Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4 space-y-3">
              {posts.length === 0 ? (
                <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No posts yet</p>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <p className="text-gray-900 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.likes?.[0]?.count || 0} likes</span>
                        <span>{post.comments?.[0]?.count || 0} comments</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="applications" className="mt-4 space-y-3">
              {applications.length === 0 ? (
                <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No job applications yet</p>
                </Card>
              ) : (
                applications.map((application) => (
                  <Card key={application.id} className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{application.job?.title}</h4>
                          <p className="text-gray-600">{application.job?.company_name}</p>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{application.job?.location}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`rounded-full ${
                            application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'hired' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Applied {formatDate(application.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="certificates" className="mt-4 space-y-3">
              {certifications.length === 0 ? (
                <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No certifications yet</p>
                </Card>
              ) : (
                certifications.map((cert) => (
                  <Card key={cert.id} className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{cert.certificate_name}</h4>
                          <p className="text-gray-600">{cert.issuer}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Issued {formatDate(cert.date_earned)}</span>
                          </div>
                          {cert.certificate_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 rounded-xl"
                              onClick={() => window.open(cert.certificate_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </MobileLayout>
  );
};