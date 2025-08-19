import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  Heart, 
  BookOpen,
  CheckCircle,
  Eye,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  onWishlist: (courseId: string) => void;
  isEnrolled: boolean;
  isWishlisted: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onWishlist,
  isEnrolled,
  isWishlisted,
  variant = 'default'
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEnroll(course.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlist(course.id);
  };

  const formatPrice = () => {
    if (!course.price || course.price === 0) return 'Free';
    return `${course.currency || '₹'}${course.price}`;
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
        <Link to={`/learning/courses/${course.id}`}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${isWishlisted ? 'text-red-500' : 'text-muted-foreground'}`}
                  onClick={handleWishlist}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{course.duration_hours}h</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{course.rating?.toFixed(1)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">{formatPrice()}</span>
                <Button size="sm" onClick={handleEnroll} disabled={isEnrolled}>
                  {isEnrolled ? 'Enrolled' : 'Enroll'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card 
      className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/learning/courses/${course.id}`}>
        <div className="relative">
          {/* Course Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary/40" />
              </div>
            )}
            
            {/* Video Preview Button */}
            {course.video_preview_url && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-black hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPreview(true);
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white ${
                isWishlisted ? 'text-red-500' : 'text-muted-foreground'
              }`}
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>

            {/* Difficulty Badge */}
            {course.difficulty_level && (
              <Badge className={`absolute top-2 left-2 text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level}
              </Badge>
            )}

            {/* Enrolled Badge */}
            {isEnrolled && (
              <Badge className="absolute bottom-2 left-2 bg-green-500 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enrolled
              </Badge>
            )}
          </div>

          {/* Course Content */}
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {course.description}
                </p>
              </div>

              {/* Instructor */}
              {course.instructor_name && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-instructor.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {course.instructor_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{course.instructor_name}</p>
                    {course.instructor_bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {course.instructor_bio}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled_count?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              {course.skills_taught && course.skills_taught.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {course.skills_taught.slice(0, 6).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills_taught.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{course.skills_taught.length - 6} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Price & Enroll Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice()}
                  {course.price && course.price > 0 && (
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      ₹{(course.price * 1.5).toFixed(0)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button onClick={handleEnroll} disabled={isEnrolled}>
                    {isEnrolled ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Enrolled
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};