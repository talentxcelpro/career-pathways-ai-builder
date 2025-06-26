
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Briefcase, 
  FileText, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Link,
  ExternalLink
} from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  title: string;
  skills: string[];
  experience_years: number;
  looking_for_job: boolean;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

interface JobApplicationData {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  ai_match_score?: number;
}

interface IntegrationInsight {
  type: 'resume' | 'profile' | 'application' | 'skill_gap';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  tool_suggestion?: string;
}

const ProfileIntegration = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplicationData[]>([]);
  const [insights, setInsights] = useState<IntegrationInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfileData();
    fetchJobApplications();
  }, []);

  useEffect(() => {
    if (profileData && jobApplications.length > 0) {
      generateInsights();
    }
  }, [profileData, jobApplications]);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchJobApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            title,
            companies (name)
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedData = data?.map(app => ({
        id: app.id,
        job_title: app.jobs?.title || 'Unknown',
        company_name: app.jobs?.companies?.name || 'Unknown',
        status: app.status,
        applied_at: app.applied_at,
        ai_match_score: app.ai_match_score
      })) || [];

      setJobApplications(formattedData);
    } catch (error) {
      console.error('Error fetching job applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    const newInsights: IntegrationInsight[] = [];

    // Profile completeness insights
    if (!profileData?.resume_url) {
      newInsights.push({
        type: 'resume',
        title: 'Missing Resume',
        description: 'Upload your resume to improve job matching accuracy',
        action: 'Upload Resume',
        priority: 'high',
        tool_suggestion: 'resume-check'
      });
    }

    if (!profileData?.title || !profileData?.skills?.length) {
      newInsights.push({
        type: 'profile',
        title: 'Incomplete Profile',
        description: 'Complete your profile to get better job recommendations',
        action: 'Complete Profile',
        priority: 'high'
      });
    }

    // Application insights
    const recentApplications = jobApplications.filter(app => {
      const daysSince = (Date.now() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    if (recentApplications.length === 0 && profileData?.looking_for_job) {
      newInsights.push({
        type: 'application',
        title: 'No Recent Applications',
        description: 'You haven\'t applied to any jobs recently. Consider increasing your application rate.',
        action: 'Find Jobs',
        priority: 'medium'
      });
    }

    // Low match score insight
    const lowMatchApps = jobApplications.filter(app => 
      app.ai_match_score && app.ai_match_score < 70
    );

    if (lowMatchApps.length > 0) {
      newInsights.push({
        type: 'skill_gap',
        title: 'Low Match Scores',
        description: `${lowMatchApps.length} applications have low match scores. Consider improving relevant skills.`,
        action: 'Analyze Skills',
        priority: 'medium',
        tool_suggestion: 'profile-score'
      });
    }

    // Cover letter suggestion
    const appsWithoutCoverLetter = jobApplications.filter(app => !app.cover_letter);
    if (appsWithoutCoverLetter.length > 0) {
      newInsights.push({
        type: 'application',
        title: 'Missing Cover Letters',
        description: 'Some applications are missing personalized cover letters',
        action: 'Generate Cover Letter',
        priority: 'medium',
        tool_suggestion: 'cover-letter'
      });
    }

    setInsights(newInsights);
  };

  const handleToolSuggestion = (toolName: string) => {
    const routes: { [key: string]: string } = {
      'resume-check': '/tools/resume-check',
      'cover-letter': '/tools/cover-letter',
      'profile-score': '/tools/profile-score',
      'salary-analyzer': '/tools/salary-analyzer'
    };

    if (routes[toolName]) {
      window.location.href = routes[toolName];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Lightbulb;
      case 'low': return CheckCircle;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{profileData.full_name}</h3>
                  <p className="text-gray-600">{profileData.title || 'No title set'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p className="text-lg">{profileData.experience_years || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Seeking</p>
                    <Badge variant={profileData.looking_for_job ? "default" : "secondary"}>
                      {profileData.looking_for_job ? 'Active' : 'Passive'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Skills ({profileData.skills?.length || 0})</p>
                  <div className="flex flex-wrap gap-1">
                    {profileData.skills?.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(profileData.skills?.length || 0) > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(profileData.skills?.length || 0) - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Profile Links</p>
                  <div className="flex space-x-2">
                    {profileData.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          Resume
                        </a>
                      </Button>
                    )}
                    {profileData.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {profileData.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profileData.github_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No profile data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Recent Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobApplications.length > 0 ? (
              <div className="space-y-3">
                {jobApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{app.job_title}</h4>
                      <p className="text-xs text-gray-600">{app.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {app.status}
                      </Badge>
                      {app.ai_match_score && (
                        <p className="text-xs text-gray-600 mt-1">
                          Match: {app.ai_match_score}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent applications</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Personalized Insights</span>
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on your profile and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const PriorityIcon = getPriorityIcon(insight.priority);
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <PriorityIcon className={`h-5 w-5 mt-0.5 ${
                      insight.priority === 'high' ? 'text-red-600' :
                      insight.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          {insight.action}
                        </Button>
                        {insight.tool_suggestion && (
                          <Button 
                            size="sm" 
                            onClick={() => handleToolSuggestion(insight.tool_suggestion!)}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Use Tool
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
              <p className="text-gray-600">Your profile looks great. Keep using our tools to maintain your competitive edge.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>Complete your profile to unlock all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">75%</span>
            </div>
            <Progress value={75} className="w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Info</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skills</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Experience</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resume</span>
                  {profileData?.resume_url ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Portfolio</span>
                  {profileData?.portfolio_url ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Social Links</span>
                  {profileData?.linkedin_url ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileIntegration;
