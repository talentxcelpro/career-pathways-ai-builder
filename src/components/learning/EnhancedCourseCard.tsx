
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, Users, Play, BookOpen, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  skills_taught?: string[];
  thumbnail_url?: string;
  category?: string;
}

interface EnhancedCourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
  userProgress?: number;
  showProgress?: boolean;
}

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({
  course,
  isEnrolled,
  onEnroll,
  userProgress = 0,
  showProgress = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncatedDescription = course.description?.length > 120 
    ? course.description.substring(0, 120) + '...'
    : course.description;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.origin + `/learning/${course.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/learning/${course.id}`);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
      <div className="relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        )}
        
        {/* Overlay actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/80 hover:bg-white"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/80 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick play button for enrolled courses */}
        {isEnrolled && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-t-lg">
            <Link to={`/learning/${course.id}`}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                <Play className="h-5 w-5 mr-2" />
                Continue Learning
              </Button>
            </Link>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className={getDifficultyColor(course.difficulty_level)}>
            {course.difficulty_level}
          </Badge>
          {course.category && (
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
          <Link to={`/learning/${course.id}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        
        <CardDescription className="text-sm">
          {showFullDescription ? course.description : truncatedDescription}
          {course.description?.length > 120 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 hover:text-blue-800 ml-1 text-xs font-medium"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Course metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration_hours}h
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.enrolled_count}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {course.rating}
            </div>
          </div>

          {/* Instructor */}
          <p className="text-sm text-gray-600">
            by <span className="font-medium text-gray-900">{course.instructor_name}</span>
          </p>

          {/* Skills preview */}
          {course.skills_taught && course.skills_taught.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.skills_taught.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {course.skills_taught.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.skills_taught.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Progress bar for enrolled courses */}
          {showProgress && isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{userProgress}%</span>
              </div>
              <Progress value={userProgress} className="h-2" />
            </div>
          )}

          {/* Price and action */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-bold text-green-600">
              {formatPrice(course.price, course.is_free)}
            </div>
            
            {isEnrolled ? (
              <Link to={`/learning/${course.id}`}>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => onEnroll(course.id)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
