
import React, { useState } from 'react';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { QuickEnrollCTA } from '@/components/learning/QuickEnrollCTA';
import { useRealDataService } from '@/hooks/useRealDataService';
import { updateMetaTags } from '@/utils/metaTags';
import { BookOpen, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [userCourses, setUserCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const {
    getAllCourses,
    getAllLearningPaths,
    getPopularCourses
  } = useRealDataService();

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Platform | TalentXcel',
      description: 'Explore courses, learning paths, and track your progress on TalentXcel\'s comprehensive learning platform.'
    });
  }, []);

  // Mock user course progress data
  React.useEffect(() => {
    const mockUserCourses = [
      {
        id: '1',
        user_id: 'mock-user',
        course_id: 'course-1',
        progress_percentage: 65,
        enrolled_at: new Date().toISOString(),
        course: {
          id: 'course-1',
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript from scratch with hands-on projects',
          duration_hours: 30,
          difficulty_level: 'beginner',
          skills_taught: ['JavaScript', 'Web Development'],
          thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500'
        }
      }
    ];
    setUserCourses(mockUserCourses);
    setEnrolledCourseIds(['course-1']);
  }, []);

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to enroll in courses');
        return;
      }

      // Mock enrollment for now
      toast.success('Successfully enrolled in course!');
      setEnrolledCourseIds(prev => [...prev, courseId]);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);

  const featuredCourse = getPopularCourses.data?.[0];

  return (
    <LearningLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Accelerate Your Career with Expert-Led Learning
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Master in-demand skills with our comprehensive courses and learning paths
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <BookOpen className="h-5 w-5 mr-2" />
              Explore Courses
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Learning Paths
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAllCourses.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Available for learning</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAllLearningPaths.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Structured career paths</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,000+</div>
            <p className="text-xs text-muted-foreground">Learning with us</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      {userCourses.length > 0 && (
        <div className="mb-8">
          <LearningProgress userCourses={userCourses} />
        </div>
      )}

      {/* Featured Course CTA */}
      {featuredCourse && (
        <div className="mb-8">
          <QuickEnrollCTA
            featuredCourse={featuredCourse}
            onEnroll={handleEnrollCourse}
            isEnrolled={isEnrolled}
          />
        </div>
      )}

      {/* Learning Tabs */}
      <LearningTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredCourses={getAllCourses.data || []}
        coursesLoading={getAllCourses.isLoading}
        learningPaths={getAllLearningPaths.data || []}
        pathsLoading={getAllLearningPaths.isLoading}
        userCourses={userCourses}
        isEnrolled={isEnrolled}
        enrollInCourse={handleEnrollCourse}
      />

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Level Up?</h2>
          <p className="text-gray-600">Explore specialized learning opportunities</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/learning/employment-bridge">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-semibold">Employment Bridge</div>
                <div className="text-sm text-gray-600">Job-focused learning</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/learning/skill-assessment">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-semibold">Skill Assessment</div>
                <div className="text-sm text-gray-600">Test your knowledge</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/learning/career-roadmap">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-semibold">Career Roadmap</div>
                <div className="text-sm text-gray-600">Plan your journey</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/learning/community">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-semibold">Community</div>
                <div className="text-sm text-gray-600">Learn together</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </LearningLayout>
  );
};

export default Learning;
