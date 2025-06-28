
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Star, Clock, Users } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  thumbnail_url?: string;
  skills_taught: string[];
}

interface AIRecommendationsProps {
  recommendations: Course[];
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onEnroll,
  isEnrolled
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">AI Recommended for You</h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Personalized
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((course) => (
          <Card key={course.id} className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <Badge className="absolute top-2 right-2 bg-blue-600">
                AI Pick
              </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {course.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration_hours}h
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.enrolled_count}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {course.skills_taught?.slice(0, 2).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <Button
                size="sm"
                className="w-full"
                onClick={() => onEnroll(course.id)}
                disabled={isEnrolled(course.id)}
              >
                {isEnrolled(course.id) ? 'Enrolled' : 'Enroll Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
