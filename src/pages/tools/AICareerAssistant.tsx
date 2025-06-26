
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AICareerAssistant = () => {
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    skills: '',
    experience: '',
    industry: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCareerGuidance = async () => {
    if (!formData.currentRole || !formData.targetRole) return;
    
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          tool: 'career-assistant',
          data: {
            ...formData,
            skills: skillsArray
          },
          userId: user?.id
        }
      });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Career guidance error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveGuidance = async () => {
    if (!results) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('saved_tool_results').insert({
        user_id: user.id,
        tool_name: 'ai-career-assistant',
        title: `Career Path: ${formData.currentRole} → ${formData.targetRole}`,
        content: { formData, results }
      });
      
      alert('Career guidance saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Assistant</h1>
          <p className="text-gray-600">
            Get personalized career guidance and actionable steps for your professional growth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Career Profile
              </CardTitle>
              <CardDescription>
                Tell us about your current situation and career goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., Junior Software Developer"
                />
              </div>

              <div>
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  value={formData.targetRole}
                  onChange={(e) => handleInputChange('targetRole', e.target.value)}
                  placeholder="e.g., Senior Product Manager"
                />
              </div>

              <div>
                <Label htmlFor="skills">Current Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="e.g., JavaScript, React, Project Management"
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="e.g., 3 years"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>

              <Button 
                onClick={getCareerGuidance}
                disabled={analyzing || !formData.currentRole || !formData.targetRole}
                className="w-full"
              >
                {analyzing ? 'Analyzing Career Path...' : 'Get Career Guidance'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Career Guidance
                </span>
                {results && (
                  <Button variant="outline" size="sm" onClick={saveGuidance}>
                    Save Guidance
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyzing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your career path...</p>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {results.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  {results.skillGaps && results.skillGaps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Skills to Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.skillGaps.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  <div>
                    <h4 className="font-medium mb-3">Action Plan</h4>
                    <div className="space-y-3">
                      {results.actionPlan?.map((action: string, index: number) => (
                        <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                          </div>
                          <span className="text-sm text-blue-800">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Expected Timeline</h4>
                    </div>
                    <p className="text-green-700">{results.timeline}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in your career details to get personalized guidance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICareerAssistant;
