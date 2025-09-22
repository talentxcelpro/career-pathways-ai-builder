
import React, { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, Users, Play, BookOpen, Heart, Share2, Sparkles, Youtube, Eye, ThumbsUp, ExternalLink } from 'lucide-react';
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
  youtube_video_id?: string;
  youtube_playlist_id?: string;
  youtube_channel_name?: string;
  video_duration?: string;
  view_count?: number;
  like_count?: number;
  content_type?: 'video' | 'playlist' | 'course';
  external_url?: string;
  language?: string;
}

interface EnhancedCourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
  userProgress?: number;
  showProgress?: boolean;
}

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = memo(({
  course,
  isEnrolled,
  onEnroll,
  userProgress = 0,
  showProgress = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = useCallback((price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  }, []);

  const getDifficultyConfig = useCallback((level: string) => {
    switch (level) {
      case 'beginner': 
        return { 
          className: 'bg-success/10 text-success border-success/20', 
          label: 'Beginner',
          icon: '🌱'
        };
      case 'intermediate': 
        return { 
          className: 'bg-warning/10 text-warning border-warning/20', 
          label: 'Intermediate',
          icon: '⚡'
        };
      case 'advanced': 
        return { 
          className: 'bg-destructive/10 text-destructive border-destructive/20', 
          label: 'Advanced',
          icon: '🚀'
        };
      default: 
        return { 
          className: 'bg-muted text-muted-foreground', 
          label: level,
          icon: '📚'
        };
    }
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.origin + `/learning/${course.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/learning/${course.id}`);
    }
  }, [course.title, course.description, course.id]);

  const handleExternalLink = useCallback(() => {
    if (course.external_url) {
      window.open(course.external_url, '_blank');
    }
  }, [course.external_url]);

  const formatNumber = useCallback((num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  const formatDuration = useCallback((duration?: string) => {
    if (!duration) return null;
    
    // Parse YouTube duration format (PT1H2M10S)
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return duration;
    
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  const getContentTypeIcon = useCallback(() => {
    switch (course.content_type) {
      case 'video':
        return <Youtube className="w-4 h-4" />;
      case 'playlist':
        return <Play className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  }, [course.content_type]);

  const getContentTypeLabel = useCallback(() => {
    switch (course.content_type) {
      case 'video':
        return 'YouTube Video';
      case 'playlist':
        return 'YouTube Playlist';
      default:
        return 'Course';
    }
  }, [course.content_type]);

  const handleEnroll = useCallback(() => {
    onEnroll(course.id);
  }, [onEnroll, course.id]);

  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
  }, []);

  const difficultyConfig = getDifficultyConfig(course.difficulty_level);
  const truncatedDescription = course.description?.length > 100 
    ? course.description.substring(0, 100) + '...'
    : course.description;

  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] bg-gradient-card backdrop-blur-apple">
      <div className="relative overflow-hidden">
        {/* Course Image */}
        {course.thumbnail_url && !imageError ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-ai flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-ai-violet/30 to-primary/10"></div>
            <BookOpen className="hero-icon text-white relative z-10" />
          </div>
        )}
        
        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-700 apple-rounded-md w-9 h-9 p-0 shadow-lg backdrop-blur-sm"
            onClick={handleLike}
          >
            <Heart className={`card-icon-sm transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          {course.external_url && (
            <Button
              size="sm" 
              className="bg-white/90 hover:bg-white text-gray-700 apple-rounded-md w-9 h-9 p-0 shadow-lg backdrop-blur-sm"
              onClick={handleExternalLink}
            >
              <ExternalLink className="card-icon-sm" />
            </Button>
          )}
          <Button
            size="sm" 
            className="bg-white/90 hover:bg-white text-gray-700 apple-rounded-md w-9 h-9 p-0 shadow-lg backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="card-icon-sm" />
          </Button>
        </div>

        {/* Course Category Badge */}
        {course.category && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
              {course.category}
            </Badge>
          </div>
        )}

        {/* Quick Play Overlay for Enrolled Courses */}
        {isEnrolled && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
            <Link to={`/learning/${course.id}`}>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 apple-rounded-xl shadow-lg">
                <Play className="icon-md mr-2" />
                Continue Learning
              </Button>
            </Link>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 space-y-3">
        {/* Content Type and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getContentTypeIcon()}
            <Badge variant="secondary" className="text-xs">
              {getContentTypeLabel()}
            </Badge>
            {course.language && (
              <Badge variant="outline" className="text-xs">
                {course.language.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-foreground">{course.rating}</span>
          </div>
        </div>
        
        {/* Difficulty Badge */}
        <div className="flex justify-start">
          <Badge className={`${difficultyConfig.className} text-xs font-medium px-3 py-1`}>
            <span className="mr-1">{difficultyConfig.icon}</span>
            {difficultyConfig.label}
          </Badge>
        </div>
        
        {/* Course Title */}
        <CardTitle className="text-subheading font-heading leading-tight group-hover:text-primary transition-colors">
          <Link to={`/learning/${course.id}`} className="hover:underline line-clamp-2">
            {course.title}
          </Link>
        </CardTitle>
        
        {/* Description */}
        <CardDescription className="text-body-small text-muted-foreground line-clamp-2">
          {truncatedDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Course Metadata */}
        <div className="grid grid-cols-2 gap-2 text-caption text-muted-foreground">
          <div className="flex items-center">
            <Clock className="card-icon-sm mr-1.5" />
            <span>
              {course.video_duration 
                ? formatDuration(course.video_duration)
                : `${course.duration_hours}h`
              }
            </span>
          </div>
          <div className="flex items-center">
            <Users className="card-icon-sm mr-1.5" />
            <span>{course.enrolled_count.toLocaleString()}</span>
          </div>
          
          {course.view_count !== undefined && (
            <div className="flex items-center">
              <Eye className="card-icon-sm mr-1.5" />
              <span>{formatNumber(course.view_count)} views</span>
            </div>
          )}
          
          {course.like_count !== undefined && (
            <div className="flex items-center">
              <ThumbsUp className="card-icon-sm mr-1.5" />
              <span>{formatNumber(course.like_count)} likes</span>
            </div>
          )}
        </div>

        {/* Instructor */}
        <p className="text-body-small text-muted-foreground">
          by <span className="font-medium text-foreground">
            {course.youtube_channel_name || course.instructor_name}
          </span>
        </p>

        {/* Skills Preview */}
        {course.skills_taught && course.skills_taught.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.skills_taught.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-caption bg-muted/50">
                {skill}
              </Badge>
            ))}
            {course.skills_taught.length > 2 && (
              <Badge variant="outline" className="text-caption bg-ai-violet/10 text-ai-violet-dark border-ai-violet/20">
                <Sparkles className="card-icon-sm mr-1" />
                +{course.skills_taught.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar for Enrolled Courses */}
        {showProgress && isEnrolled && (
          <div className="space-y-2 bg-muted/30 apple-rounded-md apple-padding-sm">
            <div className="flex justify-between text-body-small">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{userProgress}%</span>
            </div>
            <Progress value={userProgress} className="h-2" />
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2">
          <div className={`text-subheading font-bold ${course.is_free || course.price === 0 ? 'text-success' : 'text-foreground'}`}>
            {formatPrice(course.price, course.is_free)}
          </div>
          
          {isEnrolled ? (
            <Link to={`/learning/${course.id}`}>
              <Button variant="outline" size="sm" className="apple-rounded-xl">
                <Play className="card-icon-sm mr-1.5" />
                Continue
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleEnroll}
              size="sm"
              className="bg-primary hover:bg-primary/90 apple-rounded-xl px-6"
            >
              {course.content_type === 'video' || course.content_type === 'playlist' 
                ? 'Watch Now' 
                : 'Enroll Now'
              }
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
