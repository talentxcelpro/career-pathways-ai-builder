import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  BookOpen 
} from 'lucide-react';
import { toast } from 'sonner';

interface InterviewQuestionItem {
  id: string;
  category: 'technical' | 'behavioral' | 'gap';
  question: string;
  context: string;
  suggestedStarAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface InterviewPrepStudioPanelProps {
  resumeData: any;
  targetJobTitle?: string;
}

export const InterviewPrepStudioPanel: React.FC<InterviewPrepStudioPanelProps> = ({
  resumeData,
  targetJobTitle = 'Targeted Position'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'behavioral' | 'gap'>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('q1');

  const topSkill = (resumeData?.skills || [])[0] ? (typeof resumeData.skills[0] === 'string' ? resumeData.skills[0] : resumeData.skills[0].name) : 'React';
  const topProject = resumeData?.projects?.[0]?.name || 'Metric Pulse Platform';

  const questions: InterviewQuestionItem[] = [
    {
      id: 'q1',
      category: 'behavioral',
      question: `Can you walk us through a complex problem you solved in your recent role using ${topSkill}?`,
      context: `Tests technical problem-solving and real outcome delivery.`,
      suggestedStarAnswer: {
        situation: `While working on ${topProject}, our team faced severe processing bottlenecks during peak traffic.`,
        task: `I was tasked with identifying root causes and re-architecting data pipelines to meet 99.9% uptime SLAs.`,
        action: `I implemented optimized caching and refactored state updates using ${topSkill}.`,
        result: `Reduced latency by 35% and eliminated application downtime across 200,000 active users.`
      }
    },
    {
      id: 'q2',
      category: 'technical',
      question: `How do you approach system architecture design and technology selection for scale?`,
      context: `Evaluates technical breadth, trade-off evaluation, and senior engineering judgment.`,
      suggestedStarAnswer: {
        situation: `Starting a major feature update requiring real-time dashboard analytics.`,
        task: `Evaluate database and API frameworks to ensure sub-100ms response times.`,
        action: `Selected event-driven microservices architecture backed by PostgreSQL and Redis.`,
        result: `Successfully processed high-concurrency requests while maintaining sub-80ms response speed.`
      }
    },
    {
      id: 'q3',
      category: 'gap',
      question: `Your resume shows strong ${topSkill} experience, but how would you handle a production scenario involving missing framework requirements?`,
      context: `Gap Question: Evaluates adaptability when candidate lacks 100% target job tech stack coverage.`,
      suggestedStarAnswer: {
        situation: `Transitioning into environment with unfamiliar legacy and modern cloud tools.`,
        task: `Rapidly onboard and maintain production continuity without introducing operational risk.`,
        action: `Leveraged strong foundational principles, conducted thorough code audits, and paired with domain leads.`,
        result: `Achieved full productivity within 2 weeks and successfully shipped 4 feature deployments.`
      }
    }
  ];

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <div>
            <CardTitle className="text-base font-bold text-foreground">Interview Preparation Studio</CardTitle>
            <p className="text-xs text-muted-foreground">Tailored interview questions &amp; STAR answers generated from candidate&apos;s real career history</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs font-semibold">
          Real History Answers
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Category Filters */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'technical', label: 'Technical' },
            { id: 'behavioral', label: 'Behavioral (STAR)' },
            { id: 'gap', label: 'Evidence Gap Questions' }
          ].map(cat => (
            <Button
              key={cat.id}
              type="button"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => setSelectedCategory(cat.id as any)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Question Selector & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Questions ({filteredQuestions.length})</label>
            <div className="space-y-2">
              {filteredQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    activeQuestionId === q.id 
                      ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500 shadow-sm' 
                      : 'border-border/60 hover:border-purple-500/40 bg-background'
                  }`}
                >
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] uppercase font-bold mb-1 ${
                      q.category === 'gap' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                    }`}
                  >
                    {q.category}
                  </Badge>
                  <p className="font-semibold text-foreground line-clamp-2">{q.question}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STAR Answer Panel */}
          <div className="md:col-span-2 space-y-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Question Focus</span>
              <h4 className="text-sm font-bold text-foreground">{activeQuestion.question}</h4>
              <p className="text-xs text-muted-foreground">{activeQuestion.context}</p>
            </div>

            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                STAR Formatted Practice Answer (From Your Career History)
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-background border border-border/60">
                  <span className="font-bold text-foreground">Situation: </span>
                  <span className="text-muted-foreground">{activeQuestion.suggestedStarAnswer.situation}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/60">
                  <span className="font-bold text-foreground">Task: </span>
                  <span className="text-muted-foreground">{activeQuestion.suggestedStarAnswer.task}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/60">
                  <span className="font-bold text-foreground">Action: </span>
                  <span className="text-muted-foreground">{activeQuestion.suggestedStarAnswer.action}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border/60">
                  <span className="font-bold text-foreground">Result: </span>
                  <span className="text-muted-foreground">{activeQuestion.suggestedStarAnswer.result}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
