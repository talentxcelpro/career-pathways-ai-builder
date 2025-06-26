
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, Target, Lightbulb, Play, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const InterviewPrep = () => {
  const [formData, setFormData] = useState({
    jobRole: '',
    interviewType: 'behavioral',
    companyName: ''
  });
  const [preparing, setPreparing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);

  const interviewTypes = [
    { value: 'behavioral', label: 'Behavioral Interview' },
    { value: 'technical', label: 'Technical Interview' },
    { value: 'case-study', label: 'Case Study Interview' },
    { value: 'panel', label: 'Panel Interview' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const prepareInterview = async () => {
    if (!formData.jobRole || !formData.interviewType) return;
    
    setPreparing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          tool: 'interview-prep',
          data: formData,
          userId: user?.id
        }
      });

      if (error) throw error;
      setResults(data);
      setResponses(new Array(data.questions?.length || 0).fill(''));
    } catch (error) {
      console.error('Interview prep error:', error);
    } finally {
      setPreparing(false);
    }
  };

  const saveSession = async () => {
    if (!results) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('interview_sessions').insert({
        user_id: user.id,
        session_type: 'practice',
        job_role: formData.jobRole,
        questions: results.questions,
        responses: responses.filter(r => r.trim()),
        duration_minutes: results.duration
      });
      
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const updateResponse = (index: number, response: string) => {
    const newResponses = [...responses];
    newResponses[index] = response;
    setResponses(newResponses);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep</h1>
          <p className="text-gray-600">
            Practice with AI-generated questions and get personalized feedback
          </p>
        </div>

        {!results ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Interview Setup
              </CardTitle>
              <CardDescription>
                Configure your interview practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Input
                    id="jobRole"
                    value={formData.jobRole}
                    onChange={(e) => handleInputChange('jobRole', e.target.value)}
                    placeholder="e.g., Product Manager"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>
              </div>

              <div>
                <Label>Interview Type</Label>
                <Select value={formData.interviewType} onValueChange={(value) => handleInputChange('interviewType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={prepareInterview}
                disabled={preparing || !formData.jobRole}
                className="w-full"
              >
                {preparing ? 'Preparing Questions...' : 'Start Interview Prep'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Practice Questions</TabsTrigger>
              <TabsTrigger value="tips">Interview Tips</TabsTrigger>
              <TabsTrigger value="overview">Session Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Play className="h-5 w-5 mr-2" />
                      Question {activeQuestion + 1} of {results.questions?.length}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={saveSession}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Session
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Question:</h3>
                      <p className="text-blue-800">{results.questions?.[activeQuestion]}</p>
                    </div>

                    <div>
                      <Label htmlFor="response">Your Response</Label>
                      <textarea
                        id="response"
                        value={responses[activeQuestion] || ''}
                        onChange={(e) => updateResponse(activeQuestion, e.target.value)}
                        placeholder="Type your response here... Use the STAR method: Situation, Task, Action, Result"
                        className="w-full p-3 border rounded-md h-32 resize-none"
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveQuestion(Math.max(0, activeQuestion - 1))}
                        disabled={activeQuestion === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setActiveQuestion(Math.min(results.questions?.length - 1, activeQuestion + 1))}
                        disabled={activeQuestion === results.questions?.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Interview Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.tips?.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600 text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{results.duration} min</div>
                    <div className="text-sm text-gray-600">Estimated Duration</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{results.questions?.length}</div>
                    <div className="text-sm text-gray-600">Practice Questions</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      <Badge variant="outline">{results.difficulty}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">Difficulty Level</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
