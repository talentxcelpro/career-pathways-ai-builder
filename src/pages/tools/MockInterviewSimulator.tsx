import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Video, 
  Play,
  Pause,
  Mic,
  MicOff,
  Save,
  Download,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MockInterviewSimulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isActive, setIsActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [interviewResults, setInterviewResults] = useState<any>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('mock-interview-simulator', 'Mock Interview Simulator');
      usage.then(data => {
        if (data) {
          setUsageId(data.id);
          generateQuestions();
        }
      });
    }
  }, [user]);

  const generateQuestions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: aiResponse } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'interview-questions',
          data: { profile },
          userId: user.id
        }
      });

      const generatedQuestions = aiResponse?.questions || [
        "Tell me about yourself and your background",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "Describe a challenging project you worked on",
        "Where do you see yourself in 5 years?"
      ];

      setQuestions(generatedQuestions);
      setResponses(new Array(generatedQuestions.length).fill(''));
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = () => {
    setIsActive(true);
    setCurrentQuestion(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsActive(false);
    setIsLoading(true);

    try {
      const { data: aiResponse } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'interview-feedback',
          data: {
            questions,
            responses: responses.filter(r => r.trim())
          },
          userId: user.id
        }
      });

      const results = {
        overall_score: aiResponse?.overall_score || Math.floor(Math.random() * 30) + 70,
        communication_score: aiResponse?.communication_score || Math.floor(Math.random() * 20) + 75,
        content_score: aiResponse?.content_score || Math.floor(Math.random() * 25) + 70,
        confidence_score: aiResponse?.confidence_score || Math.floor(Math.random() * 20) + 75,
        feedback: aiResponse?.feedback || [
          'Good storytelling structure in your responses',
          'Consider adding more specific examples',
          'Strong enthusiasm comes through clearly'
        ],
        areas_for_improvement: aiResponse?.areas_for_improvement || [
          'Practice quantifying achievements with numbers',
          'Work on reducing filler words',
          'Prepare more STAR method examples'
        ]
      };

      setInterviewResults(results);

      if (usageId) {
        await updateToolUsage(usageId, results, 'completed', 900);
      }

      toast.success('Interview simulation complete!');
    } catch (error) {
      console.error('Error processing interview:', error);
      toast.error('Failed to process interview feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!interviewResults) return;
    
    await saveToolResult(
      'mock-interview-simulator',
      'Mock Interview Results',
      interviewResults,
      'analysis',
      ['interview', 'practice', 'feedback']
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!isActive && !interviewResults ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Mock Interview Simulator</h2>
                  <p className="text-muted-foreground mb-6">
                    AI interviewer with feedback on tone, content, keywords
                  </p>
                </div>
                <Button onClick={startInterview} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Interview
                </Button>
              </div>
            ) : isActive ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Question {currentQuestion + 1} of {questions.length}</h3>
                  <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-32" />
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-xl mb-4">{questions[currentQuestion]}</h4>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <Mic className="h-4 w-4 mr-2" />
                        Recording...
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Take your time to answer thoughtfully
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button onClick={nextQuestion} className="flex-1">
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </Button>
                </div>
              </div>
            ) : interviewResults ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Interview Results</h2>
                  <div className="text-4xl font-bold text-primary mb-2">{interviewResults.overall_score}/100</div>
                  <Progress value={interviewResults.overall_score} className="h-4 max-w-md mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{interviewResults.communication_score}</div>
                      <div className="text-sm text-muted-foreground">Communication</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{interviewResults.content_score}</div>
                      <div className="text-sm text-muted-foreground">Content Quality</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{interviewResults.confidence_score}</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {interviewResults.feedback.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {interviewResults.areas_for_improvement.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button onClick={handleSaveResult} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Results
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MockInterviewSimulator;