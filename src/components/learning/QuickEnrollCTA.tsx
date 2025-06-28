
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, TrendingUp } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  instructor_name: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  thumbnail_url?: string;
}

interface QuickEnrollCTAProps {
  featuredCourse: Course;
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const QuickEnrollCTA: React.FC<QuickEnrollCTAProps> = ({
  featuredCourse,
  onEnroll,
  isEnrolled
}) => {
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-24 md:h-24 w-16 h-16 flex-shrink-0">
            {featuredCourse.thumbnail_url ? (
              <img
                src={featuredCourse.thumbnail_url}
                alt={featuredCourse.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-800">
              Featured Course
            </Badge>
            <h3 className="text-xl font-bold mb-2">{featuredCourse.title}</h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-3">
              <span>by {featuredCourse.instructor_name}</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{featuredCourse.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{featuredCourse.duration_hours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{featuredCourse.enrolled_count}</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Start your learning journey with our most popular course. Join thousands of learners!
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(featuredCourse.price, featuredCourse.is_free)}
            </div>
            <Button
              onClick={() => onEnroll(featuredCourse.id)}
              disabled={isEnrolled(featuredCourse.id)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isEnrolled(featuredCourse.id) ? 'Enrolled' : 'Enroll Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
