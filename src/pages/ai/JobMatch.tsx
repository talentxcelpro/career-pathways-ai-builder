
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Briefcase, MapPin, Building, Loader2, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobMatch {
  jobId: string;
  matchScore: number;
  reasons: string[];
  concerns: string[];
  job?: any;
}

const JobMatch = () => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: jobs } = useQuery({
    queryKey: ['available-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const analyzeJobMatches = async () => {
    if (!currentUserProfile || !jobs) {
      toast.error('Profile data not available');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          type: 'job-match',
          data: {
            userProfile: currentUserProfile,
            preferences: currentUserProfile.preferences
          },
          userId: user?.id
        }
      });

      if (error) throw error;

      // Enrich matches with job data
      const enrichedMatches = response.matches.map((match: JobMatch) => ({
        ...match,
        job: jobs.find((job: any) => job.id === match.jobId)
      })).filter((match: JobMatch) => match.job);

      setMatches(enrichedMatches);
      toast.success('Job matching analysis completed!');
    } catch (error) {
      console.error('Job matching error:', error);
      toast.error('Failed to analyze job matches');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (currentUserProfile && jobs && jobs.length > 0) {
      analyzeJobMatches();
    }
  }, [currentUserProfile, jobs]);

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    return 'bg-yellow-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-600" />
          AI Job Matching
        </h1>
        <p className="text-gray-600 mt-2">
          Discover jobs that perfectly match your skills, experience, and career goals
        </p>
      </div>

      {/* Profile Summary */}
      {currentUserProfile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-600">Role:</span>
                <p>{currentUserProfile.title || 'Not specified'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Experience:</span>
                <p>{currentUserProfile.experience_years || 0} years</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <p>{currentUserProfile.location || 'Not specified'}</p>
              </div>
            </div>
            {currentUserProfile.skills && currentUserProfile.skills.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-600">Skills:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentUserProfile.skills.slice(0, 8).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Job Matches */}
      {isAnalyzing ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Analyzing Job Matches
            </h3>
            <p className="text-gray-600">
              AI is finding the best job opportunities for you...
            </p>
          </CardContent>
        </Card>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Job Matches</h2>
            <Button onClick={analyzeJobMatches} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Matches
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.jobId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {match.job.companies?.logo_url && (
                        <img
                          src={match.job.companies.logo_url}
                          alt={match.job.companies.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {match.job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {match.job.companies?.name}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className={`text-right p-3 rounded-lg ${getMatchBgColor(match.matchScore)}`}>
                      <div className={`text-2xl font-bold ${getMatchColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </div>
                      <div className="text-xs text-gray-600">Match</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {match.job.location}
                    </div>
                    
                    {match.job.salary_min && match.job.salary_max && (
                      <div className="text-sm font-medium text-green-600">
                        {match.job.salary_currency} {match.job.salary_min.toLocaleString()} - {match.job.salary_max.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <Progress value={match.matchScore} className="h-2" />

                  {match.reasons && match.reasons.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Why it's a great match:</h4>
                      <ul className="space-y-1">
                        {match.reasons.slice(0, 3).map((reason, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {match.concerns && match.concerns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">Things to consider:</h4>
                      <ul className="space-y-1">
                        {match.concerns.slice(0, 2).map((concern, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/jobs/${match.job.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/jobs/${match.job.id}/smart-apply`}>
                        <Heart className="h-4 w-4 mr-1" />
                        Smart Apply
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Job Matches Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to get AI-powered job recommendations
            </p>
            <Button asChild>
              <Link to="/profile/edit">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobMatch;
