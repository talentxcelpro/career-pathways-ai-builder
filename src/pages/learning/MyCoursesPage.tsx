import React, { useState } from 'react';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { MyLearningCard } from '@/components/learning/MyLearningCard';
import { EmptyMyLearning } from '@/components/learning/EmptyMyLearning';
import { updateMetaTags } from '@/utils/metaTags';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, Target } from 'lucide-react';

const MyCoursesPage = () => {
  // Mock user courses data - in real app, this would come from API
  const [userCourses] = useState([
    {
      id: '1',
      course_id: 'course_1',
      progress_percentage: 75,
      enrolled_at: '2024-01-15',
      courses: {
        title: 'React Advanced Patterns',
        duration_hours: 20,
        skills_taught: ['React', 'TypeScript', 'State Management'],
        thumbnail_url: '/placeholder-course.jpg'
      }
    },
    {
      id: '2',
      course_id: 'course_2',
      progress_percentage: 100,
      enrolled_at: '2024-01-01',
      completed_at: '2024-01-30',
      courses: {
        title: 'JavaScript Fundamentals',
        duration_hours: 15,
        skills_taught: ['JavaScript', 'ES6', 'DOM Manipulation'],
        thumbnail_url: '/placeholder-course.jpg'
      }
    },
    {
      id: '3',
      course_id: 'course_3',
      progress_percentage: 30,
      enrolled_at: '2024-02-01',
      courses: {
        title: 'Node.js Backend Development',
        duration_hours: 25,
        skills_taught: ['Node.js', 'Express', 'MongoDB'],
        thumbnail_url: '/placeholder-course.jpg'
      }
    }
  ]);

  React.useEffect(() => {
    updateMetaTags({
      title: 'My Courses | TalentXcel Learning',
      description: 'Track your learning progress, continue courses, and view your achievements.'
    });
  }, []);

  const completedCourses = userCourses.filter(uc => uc.progress_percentage === 100);
  const inProgressCourses = userCourses.filter(uc => uc.progress_percentage > 0 && uc.progress_percentage < 100);
  const allCourses = userCourses;

  const stats = [
    {
      title: 'Total Enrolled',
      value: userCourses.length,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: completedCourses.length,
      icon: Trophy,
      color: 'text-green-600'
    },
    {
      title: 'In Progress',
      value: inProgressCourses.length,
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'Total Hours',
      value: userCourses.reduce((total, uc) => total + (uc.courses.duration_hours || 0), 0),
      icon: Clock,
      color: 'text-purple-600'
    }
  ];

  if (userCourses.length === 0) {
    return (
      <LearningPageLayout heroTitle="My Learning" heroDescription="Track your progress and continue your learning journey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyMyLearning onBrowseCourses={() => window.location.href = '/learning/courses'} />
        </div>
      </LearningPageLayout>
    );
  }

  return (
    <LearningPageLayout heroTitle="My Learning" heroDescription="Track your progress and continue your learning journey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-gradient-card backdrop-blur-apple border-glass-border shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Progress Overview */}
        <LearningProgress userCourses={userCourses} />

        {/* Courses Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-gradient-card backdrop-blur-apple border-glass-border">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Courses
              <Badge variant="secondary">{allCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center gap-2">
              In Progress
              <Badge variant="secondary">{inProgressCourses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed
              <Badge variant="secondary">{completedCourses.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((userCourse) => (
                <MyLearningCard key={userCourse.id} userCourse={userCourse} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            {inProgressCourses.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No courses in progress</h3>
                <p className="text-muted-foreground">Start learning to see your progress here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map((userCourse) => (
                  <MyLearningCard key={userCourse.id} userCourse={userCourse} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedCourses.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No completed courses yet</h3>
                <p className="text-muted-foreground">Complete your first course to earn achievements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((userCourse) => (
                  <MyLearningCard key={userCourse.id} userCourse={userCourse} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </LearningPageLayout>
  );
};

export default MyCoursesPage;