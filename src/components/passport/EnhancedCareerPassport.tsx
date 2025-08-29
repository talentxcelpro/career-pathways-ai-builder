import React, { useEffect } from 'react';
import { useRealCareerData } from '@/hooks/useRealCareerData';
import { useRealTimeAchievements } from '@/hooks/useRealTimeAchievements';
import { PassportCard } from './PassportCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Award, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Target,
  Zap,
  Trophy,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EnhancedCareerPassportProps {
  userId?: string;
  userProfile?: any;
  isOwner?: boolean;
}

export function EnhancedCareerPassport({ userId, userProfile, isOwner = true }: EnhancedCareerPassportProps) {
  const { metrics, insights, achievementTriggers, isLoading, error } = useRealCareerData(userId);
  const { triggerAchievementCheck, isAwarding } = useRealTimeAchievements();
  const navigate = useNavigate();

  // Auto-check achievements when metrics change
  useEffect(() => {
    if (metrics && isOwner) {
      triggerAchievementCheck();
    }
  }, [metrics, isOwner, triggerAchievementCheck]);

  if (isLoading) {
    return <CareerPassportSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Failed to load career data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || !insights) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-5 h-5" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5" />;
    if (score >= 40) return <Target className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const earnedAchievements = achievementTriggers?.filter(a => a.earned) || [];
  const pendingAchievements = achievementTriggers?.filter(a => !a.earned) || [];

  return (
    <div className="space-y-6">
      {/* TalentXcel Passport Card */}
      <div className="flex justify-center mb-8">
        <PassportCard 
          userProfile={userProfile}
          metrics={metrics}
          insights={insights}
          userId={userId}
        />
      </div>

      {/* Header Card with Real Scores */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-16 h-16 ring-2 ring-white shadow-lg">
                <AvatarImage 
                  src={userProfile?.profile_picture_url} 
                  alt={userProfile?.full_name || 'User'} 
                />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {userProfile?.full_name || 'Career Professional'}
                </h1>
                <p className="text-muted-foreground">
                  {userProfile?.headline || 'Building an Amazing Career'}
                </p>
                {userProfile?.location && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    📍 {userProfile.location}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(insights.career_readiness_score)}`}>
                {getScoreIcon(insights.career_readiness_score)}
                <span className="ml-1">{insights.career_readiness_score}% Ready</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {insights.industry_percentile}th percentile
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Real-time Metrics Grid */}
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<FileText className="w-5 h-5" />}
              label="Resumes"
              value={metrics.resumes_count}
              color="blue"
              onClick={() => isOwner && navigate('/resume')}
            />
            <MetricCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Applications"
              value={metrics.jobs_applied_count}
              color="green"
              onClick={() => isOwner && navigate('/jobs')}
            />
            <MetricCard
              icon={<Users className="w-5 h-5" />}
              label="Connections"
              value={metrics.connections_count}
              color="purple"
              onClick={() => isOwner && navigate('/network')}
            />
            <MetricCard
              icon={<Award className="w-5 h-5" />}
              label="Assessments"
              value={metrics.assessments_completed}
              color="yellow"
              onClick={() => isOwner && navigate('/assessments')}
            />
          </div>

          {/* AI-Powered Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard
              title="Career Readiness"
              score={insights.career_readiness_score}
              description="Overall preparedness for career opportunities"
              icon={<Target className="w-6 h-6" />}
            />
            <ScoreCard
              title="Market Competitiveness"
              score={insights.market_competitiveness_score}
              description="How you compare to peers in the market"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Improvement Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Career Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
              <div className="space-y-1">
                {insights.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {strength}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-orange-600 mb-2">Improvement Areas</h4>
              <div className="space-y-1">
                {insights.improvement_areas.map((area, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-500" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              AI-powered suggestions to boost your career readiness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.next_actions.map((action, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">{action}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
            
            {insights.ai_recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h5 className="font-medium text-primary mb-2">AI Insight</h5>
                {insights.ai_recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">{rec}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Achievements ({earnedAchievements.length} earned)
            </div>
            {isAwarding && <Skeleton className="w-16 h-6" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earned Achievements */}
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned />
            ))}
            
            {/* Progress Achievements */}
            {pendingAchievements.slice(0, 4).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Supporting Components
function MetricCard({ icon, label, value, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50'
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ title, score, description, icon }: {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold ml-2">{title}</h3>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {score}%
          </Badge>
        </div>
        <Progress value={score} className="mb-2" />
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement, earned }: {
  achievement: { title: string; description: string; points: number; progress: number; requirement: number };
  earned: boolean;
}) {
  const progressPercentage = (achievement.progress / achievement.requirement) * 100;

  return (
    <Card className={`transition-all ${earned ? 'bg-yellow-50 border-yellow-200' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className={`font-medium ${earned ? 'text-yellow-700' : 'text-muted-foreground'}`}>
              {achievement.title}
            </h4>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
          <Badge variant={earned ? 'default' : 'secondary'} className="ml-2">
            {achievement.points} pts
          </Badge>
        </div>
        
        {!earned && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.requirement}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        {earned && (
          <div className="flex items-center mt-2 text-yellow-700">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Achieved!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CareerPassportSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}