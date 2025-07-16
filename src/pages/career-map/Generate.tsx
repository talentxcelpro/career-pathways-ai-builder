
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, FileText, Target, Calendar, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSimpleAI } from '@/hooks/useSimpleAI';
import { AIDebugMonitor } from '@/components/ui/ai-debug-monitor';
import { toast } from 'sonner';

const Generate = () => {
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { callAI, isLoading: processing } = useSimpleAI();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
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

  const handleGenerate = async () => {
    if (!targetRole || !timeframe) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedRoadmap(null);

    try {
      const currentRole = profile?.title || 'Current Professional';
      
      const result = await callAI({
        module: 'career_map',
        task: 'generate_roadmap',
        input: {
          currentRole,
          targetRole,
          timeframe,
          currentSkills: profile?.skills || [],
          experience: profile?.experience_years || 0,
          industry: profile?.industry || 'General',
          preferences: {
            learningStyle: 'practical',
            timeline: 'flexible'
          }
        }
      });

      if (result.success && result.response) {
        setGeneratedRoadmap(result.response);
        toast.success('Career roadmap generated successfully!');
        
        // Save to career goals
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('career_goals').insert({
            user_id: user.id,
            target_role: targetRole,
            current_position: currentRole,
            timeline_months: parseInt(timeframe),
            skills_needed: [],
            milestones: [],
            is_active: true
          });
        }
      } else {
        throw new Error(result.error || 'Failed to generate roadmap');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate career roadmap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/career-map" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Career Map
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Career Roadmap</h1>
          <p className="text-gray-600">Create an AI-powered career plan based on your profile and goals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Career Goals
                </CardTitle>
                <CardDescription>
                  Tell us about your career aspirations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-role">Target Role</Label>
                  <Input
                    id="target-role"
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timeframe">Timeframe (months)</Label>
                  <Input
                    id="timeframe"
                    type="number"
                    placeholder="e.g., 24"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!targetRole || !timeframe || isGenerating || processing}
                  className="w-full"
                >
                  {isGenerating || processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating AI Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Roadmap
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {generatedRoadmap && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600">Roadmap generated! Check your career goals.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Your Profile
                </CardTitle>
                <CardDescription>
                  We'll use this information to personalize your roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-gray-600">{profile.title || 'No title set'}</p>
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Current Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length > 6 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p>Experience: {profile.experience_years || 0} years</p>
                      <p>Industry: {profile.industry || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-4">Complete your profile for better recommendations</p>
                    <Link to="/profile/edit">
                      <Button variant="outline">Update Profile</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Features Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI-Powered Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Personalized timeline based on your experience</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-green-600" />
                    <span>Skill gap analysis and learning recommendations</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-orange-600" />
                    <span>Industry insights and market trends</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Roadmap Display */}
            {generatedRoadmap && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Generated Roadmap
                  </CardTitle>
                  <CardDescription>
                    Your AI-powered career roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeof generatedRoadmap === 'string' ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{generatedRoadmap}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {generatedRoadmap.milestones && (
                          <div>
                            <h4 className="font-medium mb-2">Key Milestones</h4>
                            <ul className="space-y-1 text-sm">
                              {generatedRoadmap.milestones.map((milestone, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {milestone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {generatedRoadmap.skills_needed && (
                          <div>
                            <h4 className="font-medium mb-2">Skills to Develop</h4>
                            <div className="flex flex-wrap gap-1">
                              {generatedRoadmap.skills_needed.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate('/career-map/my-roadmaps')}
                        variant="outline"
                      >
                        View All Roadmaps
                      </Button>
                      <Button 
                        onClick={() => {
                          setGeneratedRoadmap(null);
                          setTargetRole('');
                          setTimeframe('');
                        }}
                      >
                        Generate Another
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Monitor */}
      <AIDebugMonitor />
    </div>
  );
};

export default Generate;
