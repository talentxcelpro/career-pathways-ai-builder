import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCard } from './CourseCard';
import { 
  TrendingUp, 
  Flame, 
  Star, 
  Clock, 
  Users,
  ArrowRight,
  Calendar,
  Trophy,
  Zap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name?: string;
  instructor_bio?: string;
  duration_hours?: number;
  rating?: number;
  enrolled_count?: number;
  skills_taught?: string[];
  price?: number;
  currency?: string;
  thumbnail_url?: string;
  video_preview_url?: string;
  difficulty_level?: string;
  category?: string;
}

interface TrendingCoursesProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onWishlist: (courseId: string) => void;
  enrolledCourses: string[];
  wishlist: string[];
}

export const TrendingCourses: React.FC<TrendingCoursesProps> = ({
  courses,
  onEnroll,
  onWishlist,
  enrolledCourses,
  wishlist
}) => {
  const [activeTab, setActiveTab] = useState('popular');

  // Simulate different trending categories
  const getCoursesForTab = (tab: string) => {
    switch (tab) {
      case 'popular':
        return courses.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
      case 'highest-rated':
        return courses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'recently-added':
        return courses.slice().reverse(); // Simulate recent additions
      case 'free':
        return courses.filter(course => !course.price || course.price === 0);
      default:
        return courses;
    }
  };

  const trendingStats = [
    {
      label: 'Most Enrolled This Week',
      value: '1,247',
      change: '+32%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Highest Rated New Course',
      value: '4.9',
      change: 'New',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Fastest Growing Category',
      value: 'AI/ML',
      change: '+145%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Total Completions Today',
      value: '589',
      change: '+28%',
      icon: Trophy,
      color: 'text-purple-600'
    }
  ];

  const trendingTopics = [
    { name: 'Artificial Intelligence', growth: '+250%', courses: 47 },
    { name: 'React Development', growth: '+180%', courses: 32 },
    { name: 'Data Science', growth: '+150%', courses: 56 },
    { name: 'Cloud Computing', growth: '+140%', courses: 28 },
    { name: 'Cybersecurity', growth: '+120%', courses: 23 },
    { name: 'Mobile Development', growth: '+95%', courses: 34 }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Trending Courses</h2>
            <p className="text-muted-foreground">Most enrolled and highly rated courses</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          View All Trending
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Trending Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic, index) => (
              <div 
                key={topic.name} 
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{topic.name}</h4>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {topic.growth}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {topic.courses} courses available
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Categories Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="popular" className="text-xs">
              <Flame className="h-3 w-3 mr-1" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="highest-rated" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="recently-added" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              New
            </TabsTrigger>
            <TabsTrigger value="free" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              Free
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Updated 2 hours ago
          </div>
        </div>

        {['popular', 'highest-rated', 'recently-added', 'free'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getCoursesForTab(tab).slice(0, 8).map((course, index) => (
                <div key={course.id} className="relative">
                  {/* Trending Badge for top courses */}
                  {index < 3 && tab === 'popular' && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-lg">
                        <Flame className="h-3 w-3 mr-1" />
                        #{index + 1} Trending
                      </Badge>
                    </div>
                  )}
                  
                  {/* High Rating Badge */}
                  {course.rating && course.rating >= 4.8 && tab === 'highest-rated' && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Top Rated
                      </Badge>
                    </div>
                  )}

                  {/* New Badge */}
                  {tab === 'recently-added' && index < 4 && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white border-0 shadow-lg">
                        <Zap className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    </div>
                  )}

                  {/* Free Badge */}
                  {(!course.price || course.price === 0) && tab === 'free' && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg">
                        <Trophy className="h-3 w-3 mr-1" />
                        Free
                      </Badge>
                    </div>
                  )}

                  <CourseCard
                    course={course}
                    onEnroll={onEnroll}
                    onWishlist={onWishlist}
                    isEnrolled={enrolledCourses.includes(course.id)}
                    isWishlisted={wishlist.includes(course.id)}
                    variant="compact"
                  />
                </div>
              ))}
            </div>

            {getCoursesForTab(tab).length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try checking back later for new trending courses.
                  </p>
                  <Button variant="outline">Browse All Courses</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Don't Miss Out on Trending Skills</h3>
          <p className="text-muted-foreground mb-4">
            Join thousands of learners who are already mastering the most in-demand skills in the industry.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">View All Categories</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              Start Learning Today
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};