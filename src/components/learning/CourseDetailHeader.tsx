
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, Play, BookOpen, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  thumbnail_url?: string;
}

interface CourseDetailHeaderProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  userProgress?: number;
}

export const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({
  course,
  isEnrolled,
  onEnroll,
  userProgress = 0
}) => {
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {course.difficulty_level}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {course.duration_hours}h
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg mb-6 text-white/90">{course.description}</p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span>{course.enrolled_count} students</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-5 w-5" />
                <span>By {course.instructor_name}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {course.skills_taught?.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/30">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="lg:w-80">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl font-bold mb-4">
                {formatPrice(course.price, course.is_free)}
              </div>
              
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{userProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full" 
                        style={{ width: `${userProgress}%` }}
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-white/90">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button onClick={onEnroll} className="w-full bg-white text-blue-600 hover:bg-white/90">
                  <Award className="h-4 w-4 mr-2" />
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
