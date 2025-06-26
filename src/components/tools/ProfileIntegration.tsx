
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
  TrendingUp, 
  MapPin,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight
} from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  title?: string;
  skills?: string[];
  location?: string;
  looking_for_job?: boolean;
  experience_years?: number;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  industry?: string;
  profile_picture_url?: string;
}

interface JobApplicationData {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  ai_match_score?: number;
  jobs?: {
    title: string;
    company_id: string;
  };
}

interface ToolUsageData {
  tool_name: string;
  usage_count: number;
  last_used: string;
  avg_score?: number;
}

const ProfileIntegration = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplicationData[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegratedData();
  }, []);

  const fetchIntegratedData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfileData(profile);
      }

      // Fetch job applications with basic job info
      const { data: applications, error: appsError } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          status,
          applied_at,
          ai_match_score
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(10);

      if (appsError) {
        console.error('Error fetching applications:', appsError);
      } else {
        // For each application, fetch job details separately to avoid complex joins
        const enrichedApplications = await Promise.all(
          (applications || []).map(async (app) => {
            const { data: job } = await supabase
              .from('jobs')
              .select('title, company_id')
              .eq('id', app.job_id)
              .single();
            
            return {
              ...app,
              jobs: job
            };
          })
        );
        setJobApplications(enrichedApplications);
      }

      // Fetch tool usage analytics
      const { data: usage, error: usageError } = await supabase
        .from('tool_usage')
        .select('tool_name, created_at, results')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (usageError) {
        console.error('Error fetching tool usage:', usageError);
      } else {
        // Process tool usage data
        const toolStats = (usage || []).reduce((acc: any, item) => {
          if (!acc[item.tool_name]) {
            acc[item.tool_name] = {
              tool_name: item.tool_name,
              usage_count: 0,
              last_used: item.created_at,
              scores: []
            };
          }
          acc[item.tool_name].usage_count += 1;
          if (new Date(item.created_at) > new Date(acc[item.tool_name].last_used)) {
            acc[item.tool_name].last_used = item.created_at;
          }
          // Extract score from results if available
          if (item.results && typeof item.results === 'object' && 'score' in item.results) {
            acc[item.tool_name].scores.push(item.results.score);
          }
          return acc;
        }, {});

        const processedUsage = Object.values(toolStats).map((tool: any) => ({
          tool_name: tool.tool_name,
          usage_count: tool.usage_count,
          last_used: tool.last_used,
          avg_score: tool.scores.length > 0 
            ? tool.scores.reduce((a: number, b: number) => a + b, 0) / tool.scores.length 
            : undefined
        }));

        setToolUsage(processedUsage);
      }
    } catch (error) {
      console.error('Error fetching integrated data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile integration data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncProfileWithTools = async () => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create tool usage entries based on profile data
      if (profileData) {
        const suggestions = [];
        
        // Suggest resume update if profile is incomplete
        if (!profileData.title || !profileData.skills || profileData.skills.length === 0) {
          suggestions.push({
            user_id: user.id,
            type: 'improvement',
            title: 'Complete Your Profile',
            description: 'Add your job title and skills to get better tool recommendations.',
            tool_name: 'profile-score',
            priority: 'high',
            reason: 'Incomplete profile reduces the effectiveness of AI tools.',
            estimated_time: 10,
            potential_impact: 'high'
          });
        }

        // Suggest salary analysis if no salary preferences
        if (!profileData.preferred_salary_min || !profileData.preferred_salary_max) {
          suggestions.push({
            user_id: user.id,
            type: 'tool',
            title: 'Set Salary Expectations',
            description: 'Use the Salary Analyzer to set realistic salary expectations.',
            tool_name: 'salary-analyzer',
            priority: 'medium',
            reason: 'Salary expectations help in job matching and negotiations.',
            estimated_time: 15,
            potential_impact: 'medium'
          });
        }

        // Insert suggestions
        for (const suggestion of suggestions) {
          await supabase
            .from('user_suggestions')
            .upsert(suggestion, {
              onConflict: 'user_id,title'
            });
        }
      }

      toast({
        title: "Success",
        description: "Profile data synchronized with tools successfully!",
      });
      
      // Refresh data
      fetchIntegratedData();
    } catch (error) {
      console.error('Error syncing profile:', error);
      toast({
        title: "Error",
        description: "Failed to sync profile data.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileCompleteness = () => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.full_name,
      profileData.title,
      profileData.skills && profileData.skills.length > 0,
      profileData.location,
      profileData.industry,
      profileData.experience_years !== undefined && profileData.experience_years > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Integration</span>
          </CardTitle>
          <CardDescription>Sync your profile data with AI career tools</CardDescription>
        </CardHeader>
        <CardContent>
          {profileData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{profileData.full_name}</h3>
                  <p className="text-gray-600">{profileData.title || 'No title set'}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {profileData.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.experience_years && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Briefcase className="h-3 w-3" />
                        <span>{profileData.experience_years} years experience</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={syncProfileWithTools} disabled={syncing}>
                  {syncing ? 'Syncing...' : 'Sync with Tools'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <span className="text-sm text-gray-600">{getProfileCompleteness()}%</span>
                </div>
                <Progress value={getProfileCompleteness()} className="h-2" />
              </div>

              {profileData.skills && profileData.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {profileData.skills.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{profileData.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No profile data found. Please complete your profile first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Applications Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Job Applications</span>
          </CardTitle>
          <CardDescription>Your recent job applications and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {jobApplications.length > 0 ? (
            <div className="space-y-3">
              {jobApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {application.jobs?.title || 'Unknown Position'}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                      {application.ai_match_score && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{Math.round(application.ai_match_score)}% match</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-xs ${getApplicationStatusColor(application.status)}`}>
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No job applications found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tool Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tool Usage Analytics</span>
          </CardTitle>
          <CardDescription>How you've been using our AI career tools</CardDescription>
        </CardHeader>
        <CardContent>
          {toolUsage.length > 0 ? (
            <div className="space-y-3">
              {toolUsage.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium capitalize">{tool.tool_name.replace('-', ' ')}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{tool.usage_count} uses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Last used {new Date(tool.last_used).toLocaleDateString()}</span>
                      </div>
                      {tool.avg_score && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>Avg. score: {Math.round(tool.avg_score)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Use Tool
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No tool usage data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Integration Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Profile Data Synced</h4>
                <p className="text-xs text-gray-600 mt-1">Your profile information is being used to personalize tool recommendations.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Complete Profile for Better Results</h4>
                <p className="text-xs text-gray-600 mt-1">Add more details to your profile to get more accurate AI recommendations.</p>
              </div>
              <Button variant="outline" size="sm">
                Update Profile
              </Button>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Star className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Job Match Optimization</h4>
                <p className="text-xs text-gray-600 mt-1">Your application history is helping improve job matching accuracy.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileIntegration;
