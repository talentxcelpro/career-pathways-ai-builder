import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Award, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Trophy,
  ArrowRight,
  ExternalLink,
  Zap,
  Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export const MobileCareerPassport: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { careerPassport, achievements, isLoading, getCompletionBreakdown, getNextMilestone } = useCareerPassport();
  const navigate = useNavigate();

  const completion = getCompletionBreakdown();
  const nextMilestone = getNextMilestone();

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || profile?.full_name;
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getCompletionPercentage = () => careerPassport?.completion_percentage || 40;
  const getCareerReadiness = () => careerPassport?.career_readiness_score || 60;
  const getMarketCompetitiveness = () => careerPassport?.market_competitiveness_score || 45;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="safe-area-top" />
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
              <AvatarImage src={user?.user_metadata?.avatar_url || profile?.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Career Passport</h1>
              <p className="text-xs text-gray-500">Your professional journey</p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 rounded-full">
            <Award className="h-3 w-3 mr-1" />
            TXL{profile?.talentxcel_id?.slice(-3) || user?.id?.slice(-3) || '001'}
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white border-0 overflow-hidden relative rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-16 w-16 border-4 border-white/30 shadow-lg">
                <AvatarImage src={user?.user_metadata?.avatar_url || profile?.profile_picture_url} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}, you're {getCompletionPercentage()}% Career Ready!
                </h2>
                <p className="text-white/90 text-sm">
                  {profile?.headline || 'Complete your profile to unlock more career opportunities'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{getCareerReadiness()}%</div>
                <div className="text-white/80 text-xs">Career Readiness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getMarketCompetitiveness()}%</div>
                <div className="text-white/80 text-xs">Market Score</div>
              </div>
            </div>
            
            <Progress value={getCompletionPercentage()} className="h-3 bg-white/20 rounded-full" />
            <p className="text-white/80 text-xs mt-2">Overall Completion: {getCompletionPercentage()}%</p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {careerPassport?.resumes_count || 0}
              </div>
              <p className="text-xs text-gray-600">Resumes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {careerPassport?.jobs_applied_count || 0}
              </div>
              <p className="text-xs text-gray-600">Jobs Applied</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {careerPassport?.certifications_count || 0}
              </div>
              <p className="text-xs text-gray-600">Certifications</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {careerPassport?.connections_count || 0}
              </div>
              <p className="text-xs text-gray-600">Connections</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Next Milestone</h3>
                  <p className="text-gray-700 text-sm mb-3">{nextMilestone.message}</p>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 rounded-xl font-medium shadow-md"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Take Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievements */}
        {achievements && achievements.length > 0 && (
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {achievement.achievement_title}
                      </p>
                      <p className="text-xs text-gray-600">
                        +{achievement.points_awarded} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-2xl font-medium shadow-lg"
            onClick={() => navigate('/profile/edit')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Improve Score
          </Button>
          <Button
            variant="outline"
            className="h-14 border-2 border-gray-200 bg-white/80 hover:bg-gray-50 rounded-2xl font-medium"
            onClick={() => navigate(`/passport/${user?.id}`)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};