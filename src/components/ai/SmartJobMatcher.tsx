
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign,
  Clock,
  Star,
  ExternalLink
} from 'lucide-react';
import { useEnhancedAIService } from '@/hooks/useEnhancedAIService';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  postedDate: string;
  jobUrl: string;
}

interface SmartJobMatcherProps {
  userProfile: any;
  limit?: number;
}

export const SmartJobMatcher: React.FC<SmartJobMatcherProps> = ({
  userProfile,
  limit = 5
}) => {
  const { invokeWithFeedback, isProcessing } = useEnhancedAIService();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findMatches = async () => {
    setIsLoading(true);
    
    try {
      const result = await invokeWithFeedback({
        toolSlug: 'job-matcher',
        inputData: {
          userProfile,
          preferences: {
            remoteWork: userProfile.preferences?.remoteWork,
            salaryRange: userProfile.preferences?.salaryRange,
            industries: userProfile.preferences?.industries
          },
          limit,
          includeSkillGaps: true
        },
        category: 'job_matching'
      });

      if (result.success) {
        setMatches(result.data.matches || []);
      }
    } catch (error) {
      console.error('Job matching failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.skills?.length > 0) {
      findMatches();
    }
  }, [userProfile]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'outline';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle>Smart Job Matches</CardTitle>
          </div>
          <Button 
            onClick={findMatches} 
            disabled={isLoading || isProcessing}
            variant="outline"
            size="sm"
          >
            Refresh Matches
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1">{match.title}</h4>
                    <p className="text-muted-foreground mb-2">{match.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{match.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{match.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{match.postedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={getMatchScoreBadge(match.matchScore)} className="mb-2">
                      <Star className="h-3 w-3 mr-1" />
                      {match.matchScore}% Match
                    </Badge>
                    <div className="w-24">
                      <Progress value={match.matchScore} className="h-1" />
                    </div>
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-2 mb-4">
                  {match.matchingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1">Matching Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matchingSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200">
                            {skill}
                          </Badge>
                        ))}
                        {match.matchingSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.matchingSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {match.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-orange-700 mb-1">Skills to Develop:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.missingSkills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                            {skill}
                          </Badge>
                        ))}
                        {match.missingSkills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.missingSkills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <a href={match.jobUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Job
                    </a>
                  </Button>
                  <Button size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View All Matches
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Complete your profile to get personalized job matches</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
