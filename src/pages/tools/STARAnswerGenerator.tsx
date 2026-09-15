import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Star, 
  Copy,
  Save,
  Download,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STARAnswerGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [starResult, setStarResult] = useState<any>(null);
  
  // Form inputs
  const [question, setQuestion] = useState('');
  const [experience, setExperience] = useState('');
  const [context, setContext] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('star-answer-generator', 'STAR Answer Generator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate STAR answers');
      return;
    }

    if (!question.trim() || !experience.trim()) {
      toast.error('Please fill in the question and your experience');
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
          type: 'star-answer-generation',
          data: {
            question,
            experience,
            context,
            profile
          },
          userId: user.id
        }
      });

      const result = {
        formatted_answer: aiResponse?.formatted_answer || generateFallbackSTAR(),
        breakdown: aiResponse?.breakdown || {
          situation: "The specific scenario you were in",
          task: "What you needed to accomplish",
          action: "The steps you took to address the situation",
          result: "The outcomes you achieved"
        },
        improvement_tips: aiResponse?.improvement_tips || [
          "Add specific metrics or numbers where possible",
          "Focus on your individual contributions",
          "Highlight the impact of your actions",
          "Keep the answer concise and relevant"
        ],
        alternative_versions: aiResponse?.alternative_versions || [
          "A more concise 1-minute version",
          "A detailed 3-minute version for senior roles"
        ]
      };

      setStarResult(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 120);
      }

      toast.success('STAR answer generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate STAR answer. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSTAR = () => {
    return `**Situation:** ${experience.substring(0, 100)}...\n\n**Task:** Based on your experience, describe what needed to be accomplished.\n\n**Action:** Detail the specific steps you took to address the situation.\n\n**Result:** Highlight the positive outcomes and impact of your actions.`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSaveResult = async () => {
    if (!starResult) return;
    
    await saveToolResult(
      'star-answer-generator',
      `STAR Answer: ${question.substring(0, 50)}...`,
      starResult,
      'document',
      ['star', 'interview', 'answers']
    );
  };

  const renderResults = () => {
    if (!starResult) return null;

    return (
      <div className="space-y-6">
        {/* Generated STAR Answer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your STAR Answer
              </span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(starResult.formatted_answer)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {starResult.formatted_answer}
            </div>
          </CardContent>
        </Card>

        {/* STAR Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>STAR Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(starResult.breakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <h4 className="font-semibold capitalize mb-2 flex items-center gap-2">
                    <Badge variant="outline">{key[0].toUpperCase()}</Badge>
                    {key}
                  </h4>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {starResult.improvement_tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Alternative Versions */}
        {starResult.alternative_versions && (
          <Card>
            <CardHeader>
              <CardTitle>Alternative Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {starResult.alternative_versions.map((version: string, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium mb-1">Version {index + 1}</h5>
                    <p className="text-sm text-muted-foreground">{version}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save STAR Answer
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Answer
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
            {!starResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">STAR Answer Generator</h2>
                  <p className="text-muted-foreground mb-6">
                    Converts your experience into compelling STAR answers
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Interview Question</label>
                    <Input
                      placeholder="e.g., Tell me about a time you led a team through a difficult project..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Experience/Story</label>
                    <Textarea
                      placeholder="Describe your experience or situation in detail. Include the context, challenges, actions you took, and results..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
                    <Textarea
                      placeholder="Any additional context about the role, company, or specific aspects you want to emphasize..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* STAR Method Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">STAR Method Reminder:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><strong>S</strong>ituation - Context</div>
                      <div><strong>T</strong>ask - What needed doing</div>
                      <div><strong>A</strong>ction - What you did</div>
                      <div><strong>R</strong>esult - The outcome</div>
                    </div>
                  </CardContent>
                </Card>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Creating STAR Answer</h3>
                    <p className="text-muted-foreground">
                      Structuring your experience using the STAR method...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <Star className="h-5 w-5 mr-2" />
                    Generate STAR Answer
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

export default STARAnswerGenerator;