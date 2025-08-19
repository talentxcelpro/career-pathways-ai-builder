import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from './CourseCard';
import { Sparkles, ArrowRight, Brain, TrendingUp } from 'lucide-react';

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

interface AIRecommendationsProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onWishlist: (courseId: string) => void;
  enrolledCourses: string[];
  wishlist: string[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  courses,
  onEnroll,
  onWishlist,
  enrolledCourses,
  wishlist
}) => {
  const reasons = [
    'Based on your career goals',
    'Matches your skill level',
    'Trending in your industry',
    'Complements your existing skills',
    'High completion rate',
    'Recommended by peers'
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Recommendations</h2>
            <p className="text-muted-foreground">Personalized courses based on your profile and goals</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Your Learning Journey</h3>
              <p className="text-blue-700 text-sm mb-3">
                Based on your profile analysis, we recommend focusing on these skill areas to advance your career in Technology.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">React Development</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Data Science</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Cloud Computing</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">AI/ML</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div key={course.id} className="relative">
            {/* AI Recommendation Badge */}
            <div className="absolute -top-2 -left-2 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <TrendingUp className="h-3 w-3 mr-1" />
                {reasons[index % reasons.length]}
              </Badge>
            </div>
            
            <CourseCard
              course={course}
              onEnroll={onEnroll}
              onWishlist={onWishlist}
              isEnrolled={enrolledCourses.includes(course.id)}
              isWishlisted={wishlist.includes(course.id)}
            />
          </div>
        ))}
      </div>

      {/* Personalization CTA */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Get More Personalized Recommendations</h3>
          <p className="text-muted-foreground mb-4">
            Complete your skills assessment and career goals to receive even better course suggestions.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Complete Skills Assessment</Button>
            <Button>Update Career Goals</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};