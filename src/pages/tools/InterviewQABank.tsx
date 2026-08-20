import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plus,
  BookOpen,
  Save,
  Download,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const InterviewQABank = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [qaResults, setQaResults] = useState<any>(null);
  const [targetRole, setTargetRole] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('behavioral');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('interview-qa-bank', 'Interview Q&A Bank');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate interview questions');
      return;
    }

    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'interview-qa-generation',
          data: {
            targetRole,
            category: selectedCategory,
            profile
          },
          userId: user.id
        }
      });

      const result = {
        behavioral_questions: aiResponse?.behavioral_questions || [
          {
            question: "Tell me about a time when you had to work under pressure.",
            ideal_answer: "Use the STAR method to describe a specific situation where you successfully managed pressure, highlighting your problem-solving skills and ability to deliver results.",
            tips: ["Be specific with examples", "Focus on positive outcomes", "Show learning from the experience"]
          }
        ],
        technical_questions: aiResponse?.technical_questions || [
          {
            question: "How would you approach debugging a complex issue in production?",
            ideal_answer: "Explain a systematic approach including logging, monitoring, reproduction steps, and communication with stakeholders.",
            tips: ["Mention specific tools", "Emphasize safety and rollback plans", "Show collaborative problem-solving"]
          }
        ],
        situational_questions: aiResponse?.situational_questions || [
          {
            question: "How would you handle a disagreement with a team member?",
            ideal_answer: "Describe a professional approach focusing on understanding, compromise, and team objectives.",
            tips: ["Show emotional intelligence", "Emphasize team goals", "Demonstrate conflict resolution skills"]
          }
        ],
        role_specific_questions: aiResponse?.role_specific_questions || [
          {
            question: `What interests you most about working as a ${targetRole}?`,
            ideal_answer: "Connect your passion and skills to the specific role, showing research about the position and company.",
            tips: ["Research the company", "Connect to personal goals", "Show genuine enthusiasm"]
          }
        ]
      };

      setQaResults(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 180);
      }

      toast.success('Interview Q&A bank generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate questions. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResult = async () => {
    if (!qaResults) return;
    
    await saveToolResult(
      'interview-qa-bank',
      `Interview Q&A Bank for ${targetRole}`,
      qaResults,
      'document',
      ['interview', 'questions', 'preparation']
    );
  };

  const categories = [
    { id: 'behavioral', name: 'Behavioral', count: qaResults?.behavioral_questions?.length || 0 },
    { id: 'technical', name: 'Technical', count: qaResults?.technical_questions?.length || 0 },
    { id: 'situational', name: 'Situational', count: qaResults?.situational_questions?.length || 0 },
    { id: 'role_specific', name: 'Role-Specific', count: qaResults?.role_specific_questions?.length || 0 }
  ];

  const renderQuestionCard = (qa: any, index: number) => (
    <Card key={index} className="mb-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">{qa.question}</h4>
            <Badge variant="outline">Q{index + 1}</Badge>
          </div>
          
          <div>
            <h5 className="font-medium text-sm text-green-600 mb-2">Ideal Answer:</h5>
            <p className="text-sm text-muted-foreground">{qa.ideal_answer}</p>
          </div>

          <div>
            <h5 className="font-medium text-sm text-blue-600 mb-2">Tips:</h5>
            <ul className="space-y-1">
              {qa.tips.map((tip: string, tipIndex: number) => (
                <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!qaResults) return null;

    const currentQuestions = qaResults[`${selectedCategory}_questions`] || [];

    return (
      <div className="space-y-6">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Questions List */}
        <div>
          <h3 className="text-xl font-semibold mb-4 capitalize">
            {selectedCategory.replace('_', ' ')} Questions
          </h3>
          {currentQuestions.length > 0 ? (
            currentQuestions.map((qa: any, index: number) => renderQuestionCard(qa, index))
          ) : (
            <p className="text-muted-foreground">No questions generated for this category.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Q&A Bank
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Questions
          </Button>
        </div>
      </div>
    );
  };

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
            {!qaResults ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Interview Q&A Bank</h2>
                  <p className="text-muted-foreground mb-6">
                    Smart question generator with ideal answers for your role
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Role</label>
                    <Input
                      placeholder="e.g., Senior Software Engineer, Product Manager"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Generating Questions</h3>
                    <p className="text-muted-foreground">
                      Creating personalized interview questions and answers...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Generate Interview Questions
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewQABank;