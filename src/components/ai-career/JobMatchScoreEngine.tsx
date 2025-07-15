import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Users, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface JobMatchDetail {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: string;
  postedDate: string;
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    companyFitMatch: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

interface SkillAssessment {
  skill: string;
  userLevel: number;
  requiredLevel: number;
  importance: 'critical' | 'important' | 'preferred';
  status: 'match' | 'partial' | 'missing';
}

const JobMatchScoreEngine: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<JobMatchDetail[]>([]);

  // Fetch user profile for matching
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-matching'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (
            skill_id,
            proficiency_level,
            skills_master (name, category)
          )
        `)
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  // Fetch jobs with AI match scores
  const { data: jobMatches, isLoading } = useQuery({
    queryKey: ['job-matches', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];

      // Mock AI-calculated job matches
      const mockMatches: JobMatchDetail[] = [
        {
          jobId: '1',
          jobTitle: 'Senior React Developer',
          company: 'TechForward Inc.',
          location: 'San Francisco, CA (Remote)',
          salaryRange: '$130,000 - $170,000',
          postedDate: '2 days ago',
          overallScore: 94,
          breakdown: {
            skillsMatch: 95,
            experienceMatch: 92,
            locationMatch: 100,
            salaryMatch: 88,
            companyFitMatch: 90
          },
          matchingSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
          missingSkills: ['Docker', 'Kubernetes'],
          recommendations: [
            'Perfect skill alignment with React and TypeScript',
            'Your 5+ years experience matches requirements',
            'Remote work preference aligns with company policy',
            'Salary expectation within range'
          ],
          confidenceLevel: 'high'
        },
        {
          jobId: '2',
          jobTitle: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'Austin, TX',
          salaryRange: '$100,000 - $140,000',
          postedDate: '1 week ago',
          overallScore: 78,
          breakdown: {
            skillsMatch: 82,
            experienceMatch: 75,
            locationMatch: 60,
            salaryMatch: 95,
            companyFitMatch: 88
          },
          matchingSkills: ['JavaScript', 'React', 'Python', 'PostgreSQL'],
          missingSkills: ['Django', 'Redis', 'Celery'],
          recommendations: [
            'Strong frontend skills transfer well',
            'Backend Python experience needed',
            'Consider location or remote work discussion',
            'Excellent salary fit for your experience level'
          ],
          confidenceLevel: 'medium'
        },
        {
          jobId: '3',
          jobTitle: 'Frontend Team Lead',
          company: 'Enterprise Corp',
          location: 'New York, NY',
          salaryRange: '$150,000 - $200,000',
          postedDate: '3 days ago',
          overallScore: 85,
          breakdown: {
            skillsMatch: 90,
            experienceMatch: 80,
            locationMatch: 70,
            salaryMatch: 95,
            companyFitMatch: 85
          },
          matchingSkills: ['React', 'TypeScript', 'Team Leadership', 'Agile'],
          missingSkills: ['Vue.js', 'Angular', 'People Management Certification'],
          recommendations: [
            'Technical skills strongly aligned',
            'Leadership potential recognized in profile',
            'Consider hybrid work arrangement',
            'Significant career growth opportunity'
          ],
          confidenceLevel: 'high'
        }
      ];

      return mockMatches;
    },
    enabled: !!userProfile
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const selectedJobDetail = jobMatches?.find(job => job.jobId === selectedJob);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Job Match Engine</h1>
          <p className="text-lg text-gray-600 mt-2">
            Intelligent job matching with detailed compatibility analysis
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Match Accuracy</div>
          <div className="text-2xl font-bold text-blue-600">96.7%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Matches</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {jobMatches?.map((job) => (
                <Card 
                  key={job.jobId}
                  className={`cursor-pointer transition-all ${
                    selectedJob === job.jobId 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedJob(job.jobId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {job.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{job.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getScoreBadgeColor(job.overallScore)}>
                          {job.overallScore}%
                        </Badge>
                        <div className="flex items-center mt-1">
                          {getConfidenceIcon(job.confidenceLevel)}
                          <span className="text-xs text-gray-500 ml-1">
                            {job.confidenceLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={job.overallScore} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Match Score</span>
                      <span>{job.overallScore}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2">
          {selectedJobDetail ? (
            <div className="space-y-6">
              {/* Job Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedJobDetail.jobTitle}</CardTitle>
                      <CardDescription className="text-lg">
                        {selectedJobDetail.company}
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedJobDetail.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {selectedJobDetail.salaryRange}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedJobDetail.postedDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedJobDetail.overallScore)}`}>
                        {selectedJobDetail.overallScore}%
                      </div>
                      <div className="text-sm text-gray-500">Overall Match</div>
                      <div className="flex items-center justify-center mt-1">
                        {getConfidenceIcon(selectedJobDetail.confidenceLevel)}
                        <span className="text-xs text-gray-500 ml-1 capitalize">
                          {selectedJobDetail.confidenceLevel} Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Match Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Match Breakdown</CardTitle>
                  <CardDescription>
                    Detailed analysis of how you match this position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(selectedJobDetail.breakdown).map(([category, score]) => {
                    const categoryNames = {
                      skillsMatch: 'Skills Match',
                      experienceMatch: 'Experience Match',
                      locationMatch: 'Location Match',
                      salaryMatch: 'Salary Match',
                      companyFitMatch: 'Company Fit'
                    };

                    const categoryIcons = {
                      skillsMatch: <Target className="h-4 w-4" />,
                      experienceMatch: <TrendingUp className="h-4 w-4" />,
                      locationMatch: <MapPin className="h-4 w-4" />,
                      salaryMatch: <DollarSign className="h-4 w-4" />,
                      companyFitMatch: <Building className="h-4 w-4" />
                    };

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {categoryIcons[category as keyof typeof categoryIcons]}
                          </div>
                          <span className="font-medium">
                            {categoryNames[category as keyof typeof categoryNames]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={score} className="w-32" />
                          <span className={`font-semibold ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Matching Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedJobDetail.matchingSkills.map((skill) => (
                        <Badge key={skill} className="bg-green-100 text-green-800 border-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      Skills to Develop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedJobDetail.missingSkills.map((skill) => (
                        <Badge key={skill} className="bg-red-100 text-red-800 border-red-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>
                    Personalized insights to improve your match score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedJobDetail.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  Apply Now
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Job
                </Button>
                <Button variant="outline" className="flex-1">
                  Get Similar Jobs
                </Button>
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Job to Analyze
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Choose a job from the list to see detailed match analysis, 
                  skill breakdown, and personalized recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchScoreEngine;