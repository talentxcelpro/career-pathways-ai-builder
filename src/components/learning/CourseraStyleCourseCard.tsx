import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  Award,
  TrendingUp,
  Bookmark,
  ChevronRight
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  instructor: string;
  university?: string;
  rating: number;
  reviewCount: number;
  enrolledCount: string;
  duration: string;
  level: string;
  price: number;
  originalPrice?: number;
  skills: string[];
  thumbnail: string;
  isSpecialization?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  completionRate?: number;
  certificate: boolean;
}

interface CourseraStyleCourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'featured';
  showProgress?: boolean;
  progress?: number;
}

export const CourseraStyleCourseCard: React.FC<CourseraStyleCourseCardProps> = ({
  course,
  variant = 'default',
  showProgress = false,
  progress = 0
}) => {
  const {
    id,
    title,
    instructor,
    university,
    rating,
    reviewCount,
    enrolledCount,
    duration,
    level,
    price,
    originalPrice,
    skills,
    isSpecialization,
    isNew,
    isBestseller,
    certificate
  } = course;

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300">
        <CardContent className="p-0">
          <div className="flex">
            {/* Thumbnail */}
            <div className="w-32 h-20 bg-gradient-to-br from-blue-500 to-purple-600 relative flex-shrink-0">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              <PlayCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
              {isNew && (
                <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">NEW</Badge>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {title}
                </h3>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{instructor}</p>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span>{rating}</span>
                  <span>({reviewCount.toLocaleString()})</span>
                </div>
                <span>•</span>
                <span>{enrolledCount} enrolled</span>
              </div>

              {showProgress && (
                <div className="mb-2">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  {price === 0 ? 'Free' : `$${price}`}
                  {originalPrice && (
                    <span className="ml-2 text-xs text-gray-500 line-through">${originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{duration}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 h-full">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <PlayCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {isSpecialization && (
              <Badge className="bg-purple-600 text-white text-xs">SPECIALIZATION</Badge>
            )}
            {isNew && (
              <Badge className="bg-green-600 text-white text-xs">NEW</Badge>
            )}
            {isBestseller && (
              <Badge className="bg-orange-600 text-white text-xs">BESTSELLER</Badge>
            )}
          </div>

          {/* Bookmark */}
          <Button variant="ghost" size="sm" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Instructor & University */}
          <div className="mb-3">
            <p className="text-gray-600 font-medium">{instructor}</p>
            {university && (
              <p className="text-sm text-gray-500">{university}</p>
            )}
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span className="text-gray-900 font-medium">{rating}</span>
              <span>({reviewCount.toLocaleString()})</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{enrolledCount}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Progress (if showing) */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Bottom Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
              <span>•</span>
              <span className="capitalize">{level}</span>
              {certificate && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>Certificate</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">
                {price === 0 ? 'Free' : `$${price}`}
                {originalPrice && (
                  <span className="ml-2 text-sm text-gray-500 line-through font-normal">
                    ${originalPrice}
                  </span>
                )}
              </div>
              <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link to={`/learning/courses/${id}`}>
                  {showProgress ? 'Continue' : 'Enroll'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};