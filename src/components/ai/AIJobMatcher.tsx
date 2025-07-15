import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp, DollarSign, MapPin, Clock } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  matchingFactors: string[];
  skillGaps: string[];
  salaryComparison: {
    current: number;
    offered: number;
    difference: string;
  };
}

interface AIJobMatcherProps {
  userProfile: any;
  jobListings: any[];
  preferences: any;
  onMatchUpdate?: (matches: JobMatch[]) => void;
}

export const AIJobMatcher: React.FC<AIJobMatcherProps> = ({
  userProfile,
  jobListings,
  preferences,
  onMatchUpdate
}) => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { loading, error, matchJobs } = useAIService();

  const handleMatchJobs = async () => {
    if (!userProfile || !jobListings.length) {
      toast.error('User profile and job listings are required');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await matchJobs(userProfile, jobListings, preferences);
      
      if (response.success) {
        const parsedMatches = JSON.parse(response.data);
        setMatches(parsedMatches);
        onMatchUpdate?.(parsedMatches);
        toast.success(`Found ${parsedMatches.length} job matches!`);
      } else {
        toast.error(response.error || 'Failed to match jobs');
      }
    } catch (err) {
      toast.error('Error matching jobs');
      console.error('Job matching error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI Job Matcher
          </CardTitle>
          <CardDescription>
            Find the best job matches based on your profile and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userProfile?.name || 'User'}
              </div>
              <div className="text-sm text-muted-foreground">
                {userProfile?.title || 'Professional'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {jobListings.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Jobs
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {matches.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Matches Found
              </div>
            </div>
          </div>

          <Button 
            onClick={handleMatchJobs} 
            disabled={loading || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {loading || isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Best Matches...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Job Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Job Matches
          </h3>
          
          {matches.map((match, index) => (
            <Card key={match.jobId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{match.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{match.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {match.salary}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={getMatchVariant(match.matchScore)}
                      className="text-sm font-semibold"
                    >
                      {match.matchScore}% Match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Match Score</span>
                    <span className="font-medium">{match.matchScore}%</span>
                  </div>
                  <Progress value={match.matchScore} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Matching Factors</h4>
                    <ul className="space-y-1">
                      {match.matchingFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Skill Gaps</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.skillGaps.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {match.salaryComparison && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-600 mb-2">Salary Comparison</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <div className="font-semibold">${match.salaryComparison.current.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Offered:</span>
                        <div className="font-semibold">${match.salaryComparison.offered.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Difference:</span>
                        <div className={`font-semibold ${
                          match.salaryComparison.difference.startsWith('+') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {match.salaryComparison.difference}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Job Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};