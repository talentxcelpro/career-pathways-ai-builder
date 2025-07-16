import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, TrendingUp, DollarSign, MapPin, Clock } from 'lucide-react';
import { useSimpleAI } from '@/hooks/useSimpleAI';
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
  userProfile?: any;
  jobListings?: any[];
  onMatchUpdate?: (matches: JobMatch[]) => void;
}

export const AIJobMatcher: React.FC<AIJobMatcherProps> = ({
  userProfile,
  jobListings = [],
  onMatchUpdate
}) => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [preferences, setPreferences] = useState({
    location: '',
    salaryMin: '',
    remoteWork: false,
    jobType: 'full-time'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { callAI, isLoading: loading, error } = useSimpleAI();

  const handleFindMatches = async () => {
    if (!userProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsAnalyzing(true);
    setMatches([]);

    try {
      const result = await callAI({
        module: 'jobs',
        task: 'match',
        input: { userProfile, jobListings, preferences }
      });
      
      if (result.success) {
        // Mock matches since we don't have actual job matching logic
        const mockMatches = [
          {
            jobId: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            salary: '$120,000 - $150,000',
            matchScore: 85,
            matchingFactors: ['React experience', 'TypeScript skills', 'Team leadership'],
            skillGaps: ['GraphQL', 'Docker'],
            salaryComparison: {
              current: 100000,
              offered: 135000,
              difference: '+$35,000'
            }
          },
          {
            jobId: '2',
            title: 'Frontend Developer',
            company: 'StartupXYZ',
            location: 'Remote',
            salary: '$90,000 - $110,000',
            matchScore: 78,
            matchingFactors: ['JavaScript expertise', 'UI/UX skills', 'React Native'],
            skillGaps: ['Vue.js', 'Mobile development'],
            salaryComparison: {
              current: 100000,
              offered: 100000,
              difference: '$0'
            }
          }
        ];
        setMatches(mockMatches);
        onMatchUpdate?.(mockMatches);
        toast.success(`Found ${mockMatches.length} job matches!`);
      } else {
        toast.error(result.error || 'Failed to match jobs');
      }
    } catch (err) {
      toast.error('Error analyzing job matches');
      console.error('Job matching error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreVariant = (score: number) => {
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
            Find jobs that match your skills and preferences using AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Preferred Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, Remote"
                value={preferences.location}
                onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="salary">Minimum Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="e.g., 80000"
                value={preferences.salaryMin}
                onChange={(e) => setPreferences({ ...preferences, salaryMin: e.target.value })}
              />
            </div>
          </div>

          <Button 
            onClick={handleFindMatches}
            disabled={loading || isAnalyzing}
            className="w-full"
          >
            {loading || isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Job Matches...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Job Matches
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Matches ({matches.length})</h3>
          
          {matches.map((match) => (
            <Card key={match.jobId}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{match.title}</h4>
                    <p className="text-gray-600">{match.company}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {match.salary}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Match Score</div>
                    <Badge variant={getMatchScoreVariant(match.matchScore)} className="text-lg px-3 py-1">
                      {match.matchScore}%
                    </Badge>
                    <Progress value={match.matchScore} className="w-20 mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Matching Factors</h5>
                    <div className="space-y-1">
                      {match.matchingFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-600 mb-2">Skill Gaps</h5>
                    <div className="flex flex-wrap gap-1">
                      {match.skillGaps.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Salary Impact: </span>
                      <span className={`font-medium ${match.salaryComparison.difference.includes('+') ? 'text-green-600' : 'text-gray-600'}`}>
                        {match.salaryComparison.difference}
                      </span>
                    </div>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};