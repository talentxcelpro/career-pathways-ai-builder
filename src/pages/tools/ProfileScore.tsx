
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileScore = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfileData(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const analyzeProfile = async () => {
    if (!profileData) return;
    
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          tool: 'profile-score',
          data: {
            profile: {
              profilePicture: profileData.profile_picture_url,
              headline: profileData.title,
              summary: profileData.about,
              experience: profileData.experience_years || 0,
              skills: profileData.skills || [],
              keywords: profileData.skills || [],
              endorsements: 0,
              recommendations: 0,
              connections: 0,
              posts: 0,
              profileViews: profileData.profile_views_count || 0
            }
          },
          userId: user?.id
        }
      });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Profile analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveResults = async () => {
    if (!results) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('saved_tool_results').insert({
        user_id: user.id,
        tool_name: 'profile-score',
        title: `Profile Analysis - Score: ${results.overallScore}/100`,
        content: { results }
      });
      
      alert('Profile analysis saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good', color: 'bg-yellow-500' };
    return { variant: 'destructive' as const, label: 'Needs Work', color: 'bg-red-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Score Analysis</h1>
          <p className="text-gray-600">
            Get a comprehensive analysis of your profile with actionable improvement suggestions
          </p>
        </div>

        {!profileData ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Please complete your profile to get analysis</p>
              <Button className="mt-4" onClick={() => window.location.href = '/profile'}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        ) : !results ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Ready for Analysis
              </CardTitle>
              <CardDescription>
                Analyze your profile completeness and optimization score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What we'll analyze:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Profile completeness and missing information</li>
                    <li>• Keyword optimization for better visibility</li>
                    <li>• Professional presentation and engagement</li>
                    <li>• Areas for improvement with actionable steps</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={analyzeProfile}
                  disabled={analyzing}
                  className="w-full"
                >
                  {analyzing ? 'Analyzing Profile...' : 'Analyze My Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Score</CardTitle>
                  <Button variant="outline" size="sm" onClick={saveResults}>
                    Save Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-5xl font-bold mb-2 ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}/100
                  </div>
                  <Badge {...getScoreBadge(results.overallScore)}>
                    {getScoreBadge(results.overallScore).label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores?.completeness || 0)}`}>
                      {results.scores?.completeness || 0}%
                    </div>
                    <p className="text-gray-600">Completeness</p>
                    <Progress value={results.scores?.completeness || 0} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores?.optimization || 0)}`}>
                      {results.scores?.optimization || 0}%
                    </div>
                    <p className="text-gray-600">Optimization</p>
                    <Progress value={results.scores?.optimization || 0} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.scores?.visibility || 0)}`}>
                      {results.scores?.visibility || 0}%
                    </div>
                    <p className="text-gray-600">Visibility</p>
                    <Progress value={results.scores?.visibility || 0} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.improvements?.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-yellow-600 text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Profile Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.strengths?.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Quick Wins (1-2 days)</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Add a professional profile picture</li>
                      <li>• Write a compelling headline</li>
                      <li>• Update your skills section</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Long-term Goals (1-2 weeks)</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Write detailed work experience</li>
                      <li>• Add portfolio projects</li>
                      <li>• Engage with platform content</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScore;
