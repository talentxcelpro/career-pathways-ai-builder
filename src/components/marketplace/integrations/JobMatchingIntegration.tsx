import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIService } from '@/hooks/useAIService';
import { supabase } from '@/integrations/supabase/client';
import { Target, Briefcase, TrendingUp, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

interface JobMatchService {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  matchScore: number;
  relevantSkills: string[];
  serviceType: 'resume_optimization' | 'interview_prep' | 'skill_assessment' | 'career_coaching';
}

interface JobMatchingIntegrationProps {
  userProfile?: any;
  onServiceSelect: (serviceId: string) => void;
}

export const JobMatchingIntegration: React.FC<JobMatchingIntegrationProps> = ({
  userProfile,
  onServiceSelect
}) => {
  const [matchedServices, setMatchedServices] = useState<JobMatchService[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingStats, setMatchingStats] = useState({
    totalMatches: 0,
    averageScore: 0,
    topSkillGaps: [] as string[]
  });

  const { matchJobs, loading: aiLoading } = useAIService();

  useEffect(() => {
    if (userProfile) {
      integrateJobMatching();
    }
  }, [userProfile]);

  const integrateJobMatching = async () => {
    try {
      setLoading(true);

      // Fetch user's job matches from existing system
      const { data: userJobMatches, error } = await supabase
        .from('ai_job_matches')
        .select(`
          *,
          jobs (
            id,
            title,
            company_id,
            companies (name),
            location,
            salary_min,
            salary_max,
            skills_required
          )
        `)
        .eq('user_id', userProfile.id)
        .order('match_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      setJobMatches(userJobMatches || []);

      // Calculate matching stats
      const stats = calculateMatchingStats(userJobMatches || []);
      setMatchingStats(stats);

      // Generate service recommendations based on job matches
      const serviceRecommendations = await generateServiceRecommendations(
        userJobMatches || [],
        stats.topSkillGaps
      );
      setMatchedServices(serviceRecommendations);

    } catch (error) {
      console.error('Error integrating job matching:', error);
      toast.error('Failed to load job matching integration');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchingStats = (matches: any[]) => {
    const totalMatches = matches.length;
    const averageScore = matches.length > 0 
      ? matches.reduce((sum, match) => sum + match.match_score, 0) / matches.length 
      : 0;

    // Extract skill gaps from job matches
    const allSkillGaps: string[] = [];
    matches.forEach(match => {
      if (match.skill_gaps && Array.isArray(match.skill_gaps)) {
        match.skill_gaps.forEach((gap: any) => {
          if (typeof gap === 'object' && gap.skill_name) {
            allSkillGaps.push(gap.skill_name);
          }
        });
      }
    });

    // Get top 5 most common skill gaps
    const skillGapCounts = allSkillGaps.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSkillGaps = Object.entries(skillGapCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    return { totalMatches, averageScore, topSkillGaps };
  };

  const generateServiceRecommendations = async (
    jobMatches: any[],
    skillGaps: string[]
  ): Promise<JobMatchService[]> => {
    // Mock service recommendations based on job matching data
    const baseServices: Omit<JobMatchService, 'matchScore'>[] = [
      {
        id: 'resume-ats-optimizer',
        title: 'ATS Resume Optimization',
        description: 'Optimize your resume for Applicant Tracking Systems based on your job matches',
        category: 'Resume Services',
        price: 299,
        rating: 4.8,
        relevantSkills: ['Resume Writing', 'ATS Optimization', 'Keyword Research'],
        serviceType: 'resume_optimization'
      },
      {
        id: 'interview-coach-pro',
        title: 'Interview Coaching for Matched Jobs',
        description: 'Personalized interview preparation based on your specific job matches',
        category: 'Interview Preparation',
        price: 199,
        rating: 4.9,
        relevantSkills: ['Interview Skills', 'Communication', 'Industry Knowledge'],
        serviceType: 'interview_prep'
      },
      {
        id: 'skill-gap-assessment',
        title: 'Skill Gap Analysis & Training Plan',
        description: 'Identify and bridge skill gaps found in your job matching analysis',
        category: 'Skill Development',
        price: 149,
        rating: 4.7,
        relevantSkills: skillGaps.slice(0, 3),
        serviceType: 'skill_assessment'
      },
      {
        id: 'career-path-optimizer',
        title: 'Career Path Optimization',
        description: 'Strategic career planning based on your job match patterns and market trends',
        category: 'Career Coaching',
        price: 399,
        rating: 4.9,
        relevantSkills: ['Career Planning', 'Market Analysis', 'Goal Setting'],
        serviceType: 'career_coaching'
      }
    ];

    // Calculate match scores for each service
    return baseServices.map(service => ({
      ...service,
      matchScore: calculateServiceMatchScore(service, jobMatches, skillGaps)
    })).sort((a, b) => b.matchScore - a.matchScore);
  };

  const calculateServiceMatchScore = (
    service: Omit<JobMatchService, 'matchScore'>,
    jobMatches: any[],
    skillGaps: string[]
  ): number => {
    let score = 0;

    // Base score
    score += 20;

    // Skill gap relevance (40% weight)
    const relevantSkillGaps = service.relevantSkills.filter(skill =>
      skillGaps.some(gap => gap.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    score += (relevantSkillGaps / Math.max(service.relevantSkills.length, 1)) * 40;

    // Service type relevance based on average match score (30% weight)
    const averageMatchScore = matchingStats.averageScore;
    if (averageMatchScore < 60) {
      // Low match scores suggest need for resume/skill improvement
      if (service.serviceType === 'resume_optimization' || service.serviceType === 'skill_assessment') {
        score += 30;
      }
    } else if (averageMatchScore >= 60 && averageMatchScore < 80) {
      // Medium scores suggest need for interview prep or career coaching
      if (service.serviceType === 'interview_prep' || service.serviceType === 'career_coaching') {
        score += 30;
      }
    } else {
      // High scores suggest advanced career optimization
      if (service.serviceType === 'career_coaching') {
        score += 30;
      }
    }

    // Number of job matches factor (10% weight)
    if (jobMatches.length > 5) {
      score += 10;
    } else if (jobMatches.length > 0) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'resume_optimization': return <Target className="h-4 w-4" />;
      case 'interview_prep': return <Users className="h-4 w-4" />;
      case 'skill_assessment': return <TrendingUp className="h-4 w-4" />;
      case 'career_coaching': return <Briefcase className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Matching Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Matching Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job Matching Integration
          </CardTitle>
          <CardDescription>
            Services recommended based on your job matching performance and skill gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{matchingStats.totalMatches}</div>
              <div className="text-sm text-gray-600">Job Matches Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {Math.round(matchingStats.averageScore)}%
              </div>
              <div className="text-sm text-gray-600">Average Match Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {matchingStats.topSkillGaps.length}
              </div>
              <div className="text-sm text-gray-600">Skills to Improve</div>
            </div>
          </div>

          {/* Top Skill Gaps */}
          {matchingStats.topSkillGaps.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills to Develop:</h4>
              <div className="flex flex-wrap gap-2">
                {matchingStats.topSkillGaps.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Services Based on Job Matches</h3>
        
        {matchedServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getServiceTypeIcon(service.serviceType)}
                    <h4 className="text-lg font-semibold">{service.title}</h4>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {service.rating}
                    </span>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>

                  {service.relevantSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {service.relevantSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 mb-1">Match Score</div>
                  <div className={`text-2xl font-bold mb-2 ${getMatchScoreColor(service.matchScore)}`}>
                    {Math.round(service.matchScore)}%
                  </div>
                  <Progress value={service.matchScore} className="w-20 mb-3" />
                  
                  <div className="text-lg font-bold text-gray-900 mb-3">
                    ₹{service.price.toLocaleString()}
                  </div>
                  
                  <Button
                    onClick={() => onServiceSelect(service.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Select Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};