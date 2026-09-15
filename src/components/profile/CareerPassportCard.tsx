import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  FileText,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CareerPassportCardProps {
  showFullView?: boolean;
}

export function CareerPassportCard({ showFullView = false }: CareerPassportCardProps) {
  const { careerPassport, achievements, getCompletionBreakdown, getNextMilestone, isLoading } = useCareerPassport();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            TalentXcel Career Passport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-full mb-4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!careerPassport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            TalentXcel Career Passport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your career passport is being set up. Please refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const breakdown = getCompletionBreakdown();
  const nextMilestone = getNextMilestone();

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full -translate-y-16 translate-x-16" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          TalentXcel Career Passport
          <Badge variant="outline" className="ml-auto">
            ID: {user?.user_metadata?.talentxcel_id || 'TXL000000'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Completion Overview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Career Profile Completion</h3>
            <span className="text-2xl font-bold text-primary">
              {careerPassport.completion_percentage}%
            </span>
          </div>
          <Progress value={careerPassport.completion_percentage} className="h-3" />
          
          {nextMilestone && (
            <div className="mt-3 p-3 bg-accent/20 rounded-lg border border-accent/40">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm font-medium">Next Milestone</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {nextMilestone.message} (+{nextMilestone.points} points)
              </p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <FileText className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{careerPassport.resumes_count}</div>
            <div className="text-xs text-muted-foreground">Resumes</div>
          </div>
          <div className="text-center">
            <Briefcase className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{careerPassport.jobs_applied_count}</div>
            <div className="text-xs text-muted-foreground">Jobs Applied</div>
          </div>
          <div className="text-center">
            <GraduationCap className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{careerPassport.certifications_count}</div>
            <div className="text-xs text-muted-foreground">Certifications</div>
          </div>
          <div className="text-center">
            <CheckCircle2 className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{careerPassport.tests_completed_count}</div>
            <div className="text-xs text-muted-foreground">Tests Completed</div>
          </div>
        </div>

        {/* Readiness Scores */}
        {showFullView && (
          <div className="space-y-3">
            <h3 className="font-semibold">Career Readiness</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Career Readiness Score</span>
                <span className="font-medium">{careerPassport.career_readiness_score}/100</span>
              </div>
              <Progress value={careerPassport.career_readiness_score} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Market Competitiveness</span>
                <span className="font-medium">{careerPassport.market_competitiveness_score}/100</span>
              </div>
              <Progress value={careerPassport.market_competitiveness_score} className="h-2" />
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {achievements && achievements.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Recent Achievements</h3>
            <div className="space-y-2">
              {achievements.slice(0, showFullView ? 5 : 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg">
                  <Award className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{achievement.achievement_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{achievement.points_awarded}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last activity: {formatDistanceToNow(new Date(careerPassport.last_activity_at), { addSuffix: true })}</span>
          <Button variant="ghost" size="sm" className="h-auto p-0">
            <ExternalLink className="h-3 w-3 mr-1" />
            View Full Profile
          </Button>
        </div>

        {/* Action Buttons */}
        {!showFullView && (
          <div className="flex gap-2 pt-2">
            <Button variant="default" size="sm" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Improve Score
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}