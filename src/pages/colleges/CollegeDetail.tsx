
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar,
  BookOpen,
  Award,
  Globe,
  Star,
  Building,
  Network,
  UserPlus
} from 'lucide-react';

const CollegeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // Fetch college data
  const { data: college, isLoading, error } = useQuery({
    queryKey: ['college', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          college_courses(count),
          college_reviews(
            overall_rating,
            academic_rating,
            infrastructure_rating,
            faculty_rating,
            placement_rating
          )
        `)
        .eq('slug', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch college posts
  const { data: collegePosts } = useQuery({
    queryKey: ['collegePosts', college?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('college_posts')
        .select('*')
        .eq('college_id', college?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!college?.id
  });

  // Fetch college events
  const { data: collegeEvents } = useQuery({
    queryKey: ['collegeEvents', college?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('college_events')
        .select('*')
        .eq('college_id', college?.id)
        .eq('is_active', true)
        .order('start_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!college?.id
  });

  // Fetch college courses for programs tab
  const { data: collegeCourses } = useQuery({
    queryKey: ['collegeCourses', college?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('college_courses')
        .select('*')
        .eq('college_id', college?.id)
        .eq('is_active', true)
        .order('course_name', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!college?.id
  });

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please login to follow colleges');
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('college_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('college_id', college?.id);
        
        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed college');
      } else {
        const { error } = await supabase
          .from('college_bookmarks')
          .insert({
            user_id: user.id,
            college_id: college?.id,
            notes: 'Following this college'
          });
        
        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following college');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleApply = () => {
    navigate(`/colleges/${college?.id}/apply`);
  };

  const handleChatAI = () => {
    navigate(`/colleges/${college?.id}/chat`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">College Not Found</h1>
          <p className="text-gray-600 mb-4">The college you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/colleges')}>
            Back to Colleges
          </Button>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = college.college_reviews?.length > 0 
    ? college.college_reviews.reduce((sum: number, review: any) => sum + (review.overall_rating || 0), 0) / college.college_reviews.length
    : 4.5;

  const stats = [
    { 
      label: 'National Ranking', 
      value: college.ranking_national ? `#${college.ranking_national}` : 'N/A', 
      icon: Award 
    },
    { 
      label: 'Total Students', 
      value: college.total_students ? `${Math.round(college.total_students / 1000)}K+` : 'N/A', 
      icon: Users 
    },
    { 
      label: 'Programs Offered', 
      value: college.college_courses?.[0]?.count || '50+', 
      icon: BookOpen 
    },
    { 
      label: 'Established', 
      value: college.established_year || 'N/A', 
      icon: Calendar 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-red-600 to-red-800 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* College Header */}
        <div className="relative -mt-32 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={college.logo_url} alt={college.name} />
                  <AvatarFallback className="text-2xl">SU</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{college.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                     <div className="flex items-center">
                       <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                       <span className="font-medium">{avgRating.toFixed(1)}</span>
                     </div>
                     <div className="flex items-center">
                       <MapPin className="h-4 w-4 mr-1" />
                       {college.city}, {college.state}
                     </div>
                     <div className="flex items-center">
                       <Calendar className="h-4 w-4 mr-1" />
                       Est. {college.established_year}
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {college.ranking_national && (
                       <Badge variant="secondary">#{college.ranking_national} National Ranking</Badge>
                     )}
                     <Badge variant="outline">{college.college_type || 'University'}</Badge>
                     <Badge variant="outline" className="text-blue-600">
                       <GraduationCap className="h-3 w-3 mr-1" />
                       {college.total_students ? college.total_students.toLocaleString() : '0'} students
                     </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button onClick={handleApply}>
                  Apply Now
                </Button>
                <Button variant="outline" onClick={handleChatAI}>
                  Chat with AI
                </Button>
                {college.website && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(college.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts ({collegePosts?.length || 0})</TabsTrigger>
            <TabsTrigger value="events">Events ({collegeEvents?.length || 0})</TabsTrigger>
            <TabsTrigger value="programs">Programs ({collegeCourses?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {college.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{college.description}</p>
                    <p className="text-gray-600">
                      Stanford University has been at the forefront of innovation and academic excellence since its founding. 
                      Located in the heart of Silicon Valley, it has produced numerous leaders in technology, business, 
                      and public service.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {collegePosts && collegePosts.length > 0 ? (
                      <div className="space-y-4">
                        {collegePosts.slice(0, 3).map((post) => (
                          <div key={post.id} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-medium text-gray-900">{post.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{post.content?.substring(0, 100)}...</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No recent updates available.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Established</span>
                      <span className="font-medium">{college.established_year || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-medium">{college.total_students?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Faculty</span>
                      <span className="font-medium">{college.total_faculty?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Campus Size</span>
                      <span className="font-medium">{college.campus_size_acres ? `${college.campus_size_acres} acres` : 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alumni by Industry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { industry: 'Technology', percentage: 35 },
                        { industry: 'Finance', percentage: 20 },
                        { industry: 'Healthcare', percentage: 15 },
                        { industry: 'Consulting', percentage: 12 },
                        { industry: 'Education', percentage: 18 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.industry}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-4">
              {collegePosts && collegePosts.length > 0 ? (
                collegePosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                            <Badge variant="outline">{post.post_type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                            {post.is_featured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No posts available yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-4">
              {collegeEvents && collegeEvents.length > 0 ? (
                collegeEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.event_name}</h3>
                            <Badge variant="outline">{event.event_type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(event.start_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.venue || (event.is_online ? 'Online' : 'TBA')}
                            </div>
                            {event.max_participants && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {event.current_registrations || 0}/{event.max_participants}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button>RSVP</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No upcoming events.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collegeCourses && collegeCourses.length > 0 ? (
                collegeCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-red-600" />
                        <span>{course.course_name}</span>
                      </CardTitle>
                      <CardDescription>
                        {course.degree_type} in {course.discipline}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        {course.description || `Excellence in ${course.discipline} education with cutting-edge research opportunities and industry partnerships.`}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          <p>Duration: {course.duration_years} years</p>
                          {course.total_fees && (
                            <p>Fees: ₹{course.total_fees.toLocaleString()}</p>
                          )}
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No programs available.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeDetail;
