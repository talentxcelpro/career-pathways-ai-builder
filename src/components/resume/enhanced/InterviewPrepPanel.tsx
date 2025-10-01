import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, X, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InterviewPrepPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

interface Question {
  question: string;
  suggestedAnswer: string;
  tips: string[];
}

export const InterviewPrepPanel: React.FC<InterviewPrepPanelProps> = ({ 
  isOpen, 
  onClose, 
  resumeData 
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobTitle) {
      toast.error('Please provide a job title');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating interview questions...', { id: 'generate-questions' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-prep', {
        body: {
          resumeData,
          jobTitle,
          companyName: companyName || undefined
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      toast.dismiss('generate-questions');
      toast.success('Interview questions generated successfully!');
    } catch (error: any) {
      console.error('Interview prep generation error:', error);
      toast.dismiss('generate-questions');
      
      if (error.message?.includes('429')) {
        toast.error('Rate limit reached. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI credits exhausted. Please add credits to continue.');
      } else {
        toast.error('Failed to generate questions. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[720px] bg-background border-l shadow-xl flex flex-col">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Interview Preparation</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-5">
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title-prep">Job Title *</Label>
              <Input
                id="job-title-prep"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name-prep">Company Name (Optional)</Label>
              <Input
                id="company-name-prep"
                placeholder="e.g., Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !jobTitle}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </section>

          {questions.length > 0 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Questions ({questions.length})</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[500px] rounded-md border p-4">
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuestion(q)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedQuestion === q 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Q{idx + 1}
                          </span>
                          <p className="text-sm flex-1">{q.question}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label>Answer & Tips</Label>
                <ScrollArea className="h-[500px] rounded-md border p-4">
                  {selectedQuestion ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                          Question:
                        </h4>
                        <p className="text-sm">{selectedQuestion.question}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                          Suggested Answer:
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedQuestion.suggestedAnswer}
                        </p>
                      </div>

                      {selectedQuestion.tips.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                            Tips:
                          </h4>
                          <ul className="space-y-1">
                            {selectedQuestion.tips.map((tip, i) => (
                              <li key={i} className="text-sm flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Select a question to see the suggested answer and tips
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </main>

        <footer className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </footer>
      </aside>
    </div>
  );
};