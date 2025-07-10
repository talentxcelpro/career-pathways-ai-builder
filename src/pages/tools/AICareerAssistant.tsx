
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, TrendingUp, Target, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface CareerGuidance {
  guidance: string;
  actionPlan: string[];
}

const AICareerAssistant = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [challenges, setChallenges] = useState('');
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getCareerGuidance = async () => {
    if (!currentRole.trim() && !targetRole.trim()) {
      toast.error('Please provide your current role or target role');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          type: 'career-guide',
          data: {
            currentRole: currentRole || undefined,
            targetRole: targetRole || undefined,
            skills: skillsArray.length > 0 ? skillsArray : undefined,
            experience: experience ? parseInt(experience) : undefined,
            challenges
          },
          userId: user?.id
        }
      });

      if (error) throw error;

      setGuidance(response);
      toast.success('Career guidance generated!');
    } catch (error) {
      console.error('Career guidance error:', error);
      toast.error('Failed to generate career guidance');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          Powered by TalentXcel AI Career Assistant
        </h1>
        <p className="text-gray-600 mt-2">
          Get personalized career guidance and strategic advice for your professional journey using Powered by TalentXcel AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Career Profile
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
                  placeholder="e.g., Junior Software Developer, Marketing Specialist"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="targetRole">Target Role (Where you want to be)</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g., 3"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="skills">Current Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  placeholder="e.g., JavaScript, React, Python, Project Management"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-20"
                />
              </div>

              <div>
                <Label htmlFor="challenges">Career Challenges or Questions</Label>
                <Textarea
                  id="challenges"
                  placeholder="What specific challenges are you facing in your career? What guidance do you need?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="h-24"
                />
              </div>

              <Button
                onClick={getCareerGuidance}
                disabled={isGenerating || (!currentRole.trim() && !targetRole.trim())}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing Your Career Path...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Career Guidance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {guidance ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Personalized Career Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {guidance.guidance}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Action Plan
                  </CardTitle>
                  <CardDescription>
                    Strategic steps to achieve your career goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guidance.actionPlan.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Badge variant="outline" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                      <h4 className="font-medium text-purple-900">Immediate (Next 30 days)</h4>
                      <p className="text-purple-700 text-sm">
                        Start with the first 2-3 action items above
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-900">Short-term (3-6 months)</h4>
                      <p className="text-blue-700 text-sm">
                        Focus on skill development and networking
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-medium text-green-900">Long-term (6-12 months)</h4>
                      <p className="text-green-700 text-sm">
                        Execute your career transition strategy
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for Career Guidance
                </h3>
                <p className="text-gray-600">
                  Fill in your career profile and get personalized AI-powered guidance for your professional journey
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICareerAssistant;
