
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Users, Lightbulb, CheckCircle, Loader2, Play } from 'lucide-react';

interface InterviewPrep {
  commonQuestions: string[];
  sampleAnswers: { [key: string]: string };
  questionsToAsk: string[];
  tips: string[];
  researchPoints: string[];
}

const InterviewPrep = () => {
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level');
  const [preparation, setPreparation] = useState<InterviewPrep | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);

  const generateInterviewPrep = async () => {
    if (!jobRole.trim()) {
      toast.error('Please provide a job role');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          type: 'interview-prep',
          data: {
            jobRole,
            company: companyName,
            experienceLevel
          },
          userId: user?.id
        }
      });

      if (error) throw error;

      setPreparation(response);
      toast.success('Interview preparation generated!');
    } catch (error) {
      console.error('Interview prep error:', error);
      toast.error('Failed to generate interview preparation');
    } finally {
      setIsGenerating(false);
    }
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
  };

  const nextQuestion = () => {
    if (preparation && currentQuestionIndex < preparation.commonQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setPracticeMode(false);
      toast.success('Practice session completed!');
    }
  };

  const experienceLevels = ['Entry', 'Mid-level', 'Senior', 'Executive'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          AI Interview Preparation
        </h1>
        <p className="text-gray-600 mt-2">
          Get personalized interview questions, tips, and practice sessions
        </p>
      </div>

      {!practiceMode ? (
        <div className="space-y-6">
          {/* Setup Section */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
              <CardDescription>
                Tell us about the role you're interviewing for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobRole">Job Role *</Label>
                  <Input
                    id="jobRole"
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google, Microsoft"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Experience Level</Label>
                <div className="flex gap-2 mt-2">
                  {experienceLevels.map((level) => (
                    <Badge
                      key={level}
                      variant={experienceLevel === level ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setExperienceLevel(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateInterviewPrep}
                disabled={isGenerating || !jobRole.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Interview Prep...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate AI Interview Prep
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {preparation && (
            <Tabs defaultValue="questions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="answers">Sample Answers</TabsTrigger>
                <TabsTrigger value="ask">Questions to Ask</TabsTrigger>
                <TabsTrigger value="tips">Tips & Research</TabsTrigger>
              </TabsList>

              <TabsContent value="questions">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Common Interview Questions</CardTitle>
                      <Button onClick={startPractice}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Practice
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {preparation.commonQuestions?.map((question, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <p className="text-gray-900">{question}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="answers">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Answers with STAR Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(preparation.sampleAnswers || {}).map(([question, answer], index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">{question}</h4>
                          <p className="text-gray-700 text-sm whitespace-pre-line">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ask">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions to Ask the Interviewer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {preparation.questionsToAsk?.map((question, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{question}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tips">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Interview Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {preparation.tips?.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Research Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {preparation.researchPoints?.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
        /* Practice Mode */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Practice Session</CardTitle>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {preparation?.commonQuestions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900 mb-4">
                {preparation?.commonQuestions[currentQuestionIndex]}
              </div>
              <p className="text-gray-600">
                Take your time to think about your answer. Use the STAR method: 
                Situation, Task, Action, Result.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setPracticeMode(false)}>
                End Practice
              </Button>
              <Button onClick={nextQuestion}>
                {currentQuestionIndex < (preparation?.commonQuestions.length || 0) - 1 
                  ? 'Next Question' 
                  : 'Finish Practice'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewPrep;
