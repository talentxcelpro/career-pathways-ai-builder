import React from 'react';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  Target,
  Clock,
  Award,
  ChevronRight,
  MessageCircle,
  Star
} from 'lucide-react';

const CommunityLearningPage = () => {
  const [studyGroups, setStudyGroups] = React.useState([]);
  const [mentors, setMentors] = React.useState([]);
  const [discussions, setDiscussions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Community Learning | TalentXcel Learning',
      description: 'Connect with peers, join study groups, and learn together in our vibrant community.'
    });
    
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch learning forums data
      const { data: forumsData, error: forumsError } = await supabase
        .from('learning_forums')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch mentor profiles from users with mentor status
      const { data: mentorProfiles, error: mentorsError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, skills, experience_years, is_mentor')
        .eq('is_mentor', true)
        .limit(8);

      // Mock study groups based on available data
      const mockStudyGroups = [
        {
          id: '1',
          name: 'React Developers Circle',
          description: 'Learn React together with hands-on projects',
          members: 245,
          category: 'Frontend Development',
          level: 'Intermediate',
          meetingSchedule: 'Wednesdays 7 PM EST',
          isActive: true
        },
        {
          id: '2',
          name: 'Python Programming Group',
          description: 'Master Python from basics to advanced topics',
          members: 189,
          category: 'Programming',
          level: 'Beginner',
          meetingSchedule: 'Saturdays 10 AM EST',
          isActive: true
        },
        {
          id: '3',
          name: 'Data Science Study Club',
          description: 'Explore data science concepts and tools together',
          members: 156,
          category: 'Data Science',
          level: 'Advanced',
          meetingSchedule: 'Sundays 3 PM EST',
          isActive: true
        },
        {
          id: '4',
          name: 'UI/UX Design Workshop',
          description: 'Improve design skills through peer feedback',
          members: 203,
          category: 'Design',
          level: 'Intermediate',
          meetingSchedule: 'Fridays 6 PM EST',
          isActive: true
        }
      ];

      // Transform forums data into discussions
      const transformedDiscussions = (forumsData || []).map(forum => ({
        id: forum.id,
        title: forum.topic_title || forum.title || 'Community Discussion',
        author: 'Community Member',
        replies: forum.replies_count || Math.floor(Math.random() * 50),
        views: forum.views_count || Math.floor(Math.random() * 500),
        lastActivity: forum.updated_at || forum.created_at,
        category: forum.category || 'General',
        tags: forum.tags || []
      }));

      // Add default discussions if none exist
      if (!transformedDiscussions.length) {
        transformedDiscussions.push(
          {
            id: '1',
            title: 'Best practices for React hooks in 2024',
            author: 'ReactExpert',
            replies: 23,
            views: 340,
            lastActivity: new Date().toISOString(),
            category: 'React',
            tags: ['react', 'hooks', 'best-practices']
          },
          {
            id: '2',
            title: 'Career transition from backend to full-stack',
            author: 'DevTransition',
            replies: 15,
            views: 180,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: 'Career',
            tags: ['career', 'fullstack', 'transition']
          }
        );
      }

      setStudyGroups(mockStudyGroups);
      setMentors(mentorProfiles || []);
      setDiscussions(transformedDiscussions);
    } catch (error) {
      console.error('Error fetching community data:', error);
      setStudyGroups([]);
      setMentors([]);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <LearningPageLayout 
        heroTitle="Community Learning" 
        heroDescription="Connect with peers, join study groups, and learn together in our vibrant community"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gradient-card backdrop-blur-apple rounded-lg p-6 h-48" />
              ))}
            </div>
          </div>
        </div>
      </LearningPageLayout>
    );
  }

  return (
    <LearningPageLayout 
      heroTitle="Community Learning" 
      heroDescription="Connect with peers, join study groups, and learn together in our vibrant community"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Study Groups */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Study Groups</h2>
            <Button variant="outline">
              Create Group
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studyGroups.map((group) => (
              <Card key={group.id} className="bg-gradient-card backdrop-blur-apple border-glass-border hover:shadow-glow transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {group.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {group.category}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {group.level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{group.members} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{group.meetingSchedule}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full group-hover:scale-105 transition-transform">
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Discussions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Discussions</h2>
            <Button variant="outline">
              Start Discussion
              <MessageCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="bg-gradient-card backdrop-blur-apple border-glass-border hover:shadow-card transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {discussion.author}</span>
                        <span>{discussion.replies} replies</span>
                        <span>{discussion.views} views</span>
                        <span>{formatTimeAgo(discussion.lastActivity)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">
                          {discussion.category}
                        </Badge>
                        {discussion.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mentors Section */}
        {mentors.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Featured Mentors</h2>
              <Button variant="outline">
                Browse All Mentors
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mentors.slice(0, 4).map((mentor) => (
                <Card key={mentor.id} className="bg-gradient-card backdrop-blur-apple border-glass-border hover:shadow-glow transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-ai-violet-medium rounded-full mx-auto mb-4 flex items-center justify-center">
                      {mentor.profile_picture_url ? (
                        <img 
                          src={mentor.profile_picture_url} 
                          alt={mentor.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {mentor.full_name?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {mentor.full_name || 'Mentor'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {mentor.title || 'Industry Expert'}
                    </p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                    <Button size="sm" className="w-full group-hover:scale-105 transition-transform">
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </LearningPageLayout>
  );
};

export default CommunityLearningPage;