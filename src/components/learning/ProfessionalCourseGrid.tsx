import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  BookOpen, 
  Award, 
  TrendingUp,
  ChevronRight,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  price: number;
  category: string;
  thumbnail?: string;
  tags: string[];
  progress?: number;
  isEnrolled?: boolean;
}

interface ProfessionalCourseGridProps {
  courses: Course[];
  loading?: boolean;
  showProgress?: boolean;
}

const levelColors = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-purple-100 text-purple-700 border-purple-200',
  expert: 'bg-red-100 text-red-700 border-red-200'
};

const categoryColors = {
  'Technology': 'bg-blue-50 text-blue-700 border-blue-200',
  'Business': 'bg-green-50 text-green-700 border-green-200',
  'Design': 'bg-purple-50 text-purple-700 border-purple-200',
  'Marketing': 'bg-orange-50 text-orange-700 border-orange-200',
  'Data Science': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Healthcare': 'bg-pink-50 text-pink-700 border-pink-200'
};

export const ProfessionalCourseGrid: React.FC<ProfessionalCourseGridProps> = ({
  courses,
  loading = false,
  showProgress = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardContent className="p-6 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card 
          key={course.id} 
          className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
        >
          {/* Course Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <BookOpen className="h-16 w-16 text-primary/60" />
              </div>
            )}
            
            {/* Overlay with Quick Action */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* Level Badge */}
            <Badge 
              className={`absolute top-3 left-3 ${levelColors[course.level?.toLowerCase() as keyof typeof levelColors] || 'bg-gray-100 text-gray-700'}`}
            >
              {course.level}
            </Badge>

            {/* Category Badge */}
            <Badge 
              variant="secondary"
              className={`absolute top-3 right-3 ${categoryColors[course.category as keyof typeof categoryColors] || 'bg-muted text-muted-foreground'}`}
            >
              {course.category}
            </Badge>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              {course.isEnrolled && (
                <Badge className="bg-green-100 text-green-700 shrink-0">
                  Enrolled
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Instructor */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{course.instructor}</span>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{course.students.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                <span className="font-medium">{course.rating}</span>
              </div>
            </div>

            {/* Progress Bar (if enrolled) */}
            {showProgress && course.isEnrolled && course.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-lg font-bold text-primary">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              
              <Link to={`/learning/courses/${course.id}`}>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform"
                >
                  {course.isEnrolled ? 'Continue' : 'Enroll Now'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};