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
  BookOpen,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  provider: string;
  courses: number;
  duration: string;
  level: string;
  rating: number;
  enrolledCount: string;
  skills: string[];
  completionRate?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  certificate: boolean;
  partnerLogo?: string;
}

interface CourseraStylePathCardProps {
  path: LearningPath;
  variant?: 'default' | 'compact';
  showProgress?: boolean;
  progress?: number;
}

export const CourseraStylePathCard: React.FC<CourseraStylePathCardProps> = ({
  path,
  variant = 'default',
  showProgress = false,
  progress = 0
}) => {
  const {
    id,
    title,
    description,
    provider,
    courses,
    duration,
    level,
    rating,
    enrolledCount,
    skills,
    isNew,
    isBestseller,
    certificate
  } = path;

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-gray-500">{provider}</p>
            </div>
            {isNew && (
              <Badge className="bg-green-600 text-white text-xs">NEW</Badge>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
            <span>{courses} courses</span>
            <span>•</span>
            <span>{duration}</span>
            <span>•</span>
            <span className="capitalize">{level}</span>
          </div>

          {showProgress && (
            <div className="mb-3">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span className="text-gray-900 font-medium">{rating}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 h-full">
      <CardContent className="p-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col space-y-1">
              {isNew && (
                <Badge className="bg-green-600 text-white text-xs self-end">NEW</Badge>
              )}
              {isBestseller && (
                <Badge className="bg-orange-600 text-white text-xs self-end">BESTSELLER</Badge>
              )}
            </div>
          </div>

          <div className="mb-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs mb-3">
              PROFESSIONAL CERTIFICATE
            </Badge>
            <h3 className="font-bold text-xl mb-2 group-hover:text-blue-100 transition-colors">
              {title}
            </h3>
            <p className="text-blue-100 text-sm mb-3 line-clamp-2">
              {description}
            </p>
            <p className="text-white/90 font-medium text-sm">{provider}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{courses}</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{duration}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-4 w-4 fill-current text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">{rating}</span>
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>

          {/* Progress (if showing) */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Your Progress</span>
                <span className="text-gray-900 font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{Math.floor((progress / 100) * courses)} of {courses} courses completed</p>
            </div>
          )}

          {/* Skills */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills you'll gain</h4>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Hands-on projects</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Flexible schedule</span>
            </div>
            {certificate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award className="h-4 w-4 text-yellow-600" />
                <span>Professional certificate</span>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-1 mb-1">
                <Users className="h-4 w-4" />
                <span>{enrolledCount} enrolled</span>
              </div>
              <span className="capitalize">{level} level</span>
            </div>
            <Button 
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to={`/learning/paths/${id}`}>
                {showProgress ? 'Continue Path' : 'Start Path'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};