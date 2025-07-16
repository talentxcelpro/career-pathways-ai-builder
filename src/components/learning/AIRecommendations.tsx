
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Star, Clock, Users, Sparkles, Trophy, TrendingUp, Zap, Target } from 'lucide-react';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  thumbnail_url?: string;
  skills_taught: string[];
  match_score?: number;
  reason?: string;
  badge?: 'Perfect Match' | 'Trending' | 'Quick Win' | 'Skill Builder' | 'Career Boost';
}

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onEnroll,
  isEnrolled
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Building Your Recommendations</h3>
        <p className="text-sm text-slate-600">Complete your profile to get personalized course suggestions</p>
      </div>
    );
  }

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'Perfect Match': return <Trophy className="h-3 w-3" />;
      case 'Trending': return <TrendingUp className="h-3 w-3" />;
      case 'Quick Win': return <Zap className="h-3 w-3" />;
      case 'Skill Builder': return <Target className="h-3 w-3" />;
      case 'Career Boost': return <Sparkles className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Perfect Match': return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0';
      case 'Trending': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0';
      case 'Quick Win': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0';
      case 'Skill Builder': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0';
      case 'Career Boost': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((course) => (
          <Card 
            key={course.id} 
            className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden hover:scale-[1.02] cursor-pointer"
          >
            <div className="relative">
              {/* Course Image */}
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white/80" />
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Badge */}
                <Badge className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 shadow-lg ${getBadgeColor(course.badge)}`}>
                  <div className="flex items-center gap-1">
                    {getBadgeIcon(course.badge)}
                    {course.badge || 'AI Pick'}
                  </div>
                </Badge>

                {/* Match Score */}
                {course.match_score && course.match_score > 70 && (
                  <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-bold">{course.match_score}% Match</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title & Description */}
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>
                  {course.reason && (
                    <p className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {course.reason}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course.enrolled_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Skills */}
                {course.skills_taught && course.skills_taught.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.skills_taught.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-slate-50/80 text-slate-700 border-slate-200">
                        {skill}
                      </Badge>
                    ))}
                    {course.skills_taught.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-50/80 text-slate-500 border-slate-200">
                        +{course.skills_taught.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  size="sm"
                  onClick={() => onEnroll(course.id)}
                  disabled={isEnrolled(course.id)}
                  className={`w-full text-xs font-medium py-2 rounded-xl transition-all duration-300 ${
                    isEnrolled(course.id)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isEnrolled(course.id) ? (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Enrolled
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Enroll Now
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
