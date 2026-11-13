// src/components/products/jobmatch/AIInterviewPrepCoach.tsx
// AI Interview Preparation Coach & Role Simulator for JobMatch OS
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  FileText, 
  Copy, 
  Play, 
  RotateCcw, 
  Layers, 
  Building2, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { generateInterviewPrep, InterviewPrepQuestion } from '@/services/jobs/aiJobMatchEngine';
import { JobDetailItem } from './JobDetailDrawer';

interface AIInterviewPrepCoachProps {
  jobs?: JobDetailItem[];
  selectedJob?: JobDetailItem | null;
  onClose?: () => void;
}

export const AIInterviewPrepCoach: React.FC<AIInterviewPrepCoachProps> = ({
  jobs = [],
  selectedJob,
  onClose
}) => {
  const [activeJobId, setActiveJobId] = useState<string>(() => {
    return selectedJob?.id || (jobs?.[0]?.id || 'demo');
  });

  const activeJob = useMemo(() => {
    return selectedJob || (jobs || []).find(j => j.id === activeJobId) || jobs?.[0] || {
      id: 'demo',
      title: 'Senior Full Stack Engineer',
      company_name: 'Zomato Engineering',
      skills_required: ['React', 'Node.js', 'System Architecture', 'PostgreSQL']
    };
  }, [jobs, selectedJob, activeJobId]);

  // Generate Questions
  const questions = useMemo(() => {
    return generateInterviewPrep(
      activeJob.title, 
      activeJob.skills_required || ['System Architecture', 'Scalability'],
      activeJob.company_name
    );
  }, [activeJob]);

  // Practice Timer State
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');

  const handleCopyQuestions = () => {
    const text = questions.map((q, i) => `${i + 1}. [${q.category}] ${q.question}\nSuggested Framework: ${q.suggestedFramework}\n`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Interview questions copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-black text-xl text-[#111827] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#2563EB]" />
            <span>AI Interview Preparation Coach</span>
          </h3>
          <p className="text-xs text-[#64748B]">
            Role-tailored technical, system design, and STAR behavioral interview scenarios generated for target vacancies.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyQuestions}
          className="text-xs font-semibold text-[#2563EB] border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl h-8 px-3 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Study Guide</span>
        </Button>
      </div>

      {/* Role Picker */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Active Practice Role:</span>
          <div className="font-bold text-sm text-[#111827]">{activeJob.title} at {activeJob.company_name}</div>
        </div>

        <select 
          value={activeJobId}
          onChange={(e) => setActiveJobId(e.target.value)}
          className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-[#111827] focus:outline-hidden max-w-xs"
        >
          {jobs.slice(0, 15).map(j => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.company_name})
            </option>
          ))}
        </select>
      </div>

      {/* Generated Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={idx} className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="bg-[#F4F7FC]/70 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs font-bold ${
                  q.category === 'Technical Core' ? 'bg-blue-50 text-[#2563EB] border-blue-200' :
                  q.category === 'Architecture & Design' ? 'bg-purple-50 text-[#7138E8] border-purple-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Question {idx + 1}: {q.category}
                </Badge>
                <span className="text-[11px] text-[#64748B] font-medium">Evaluation Criterion</span>
              </div>
              <CardTitle className="text-base font-bold text-[#111827] mt-2 leading-snug">
                "{q.question}"
              </CardTitle>
              <CardDescription className="text-xs text-[#475569]">
                💡 Context: {q.context}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1">
                <strong className="text-[#111827] block text-[11px] uppercase tracking-wider">
                  Recommended Answer Framework:
                </strong>
                <p className="text-[#475569] leading-relaxed">
                  {q.suggestedFramework}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Practice Scratchpad */}
      <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>Practice Scratchpad & Answer Formulation</span>
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            Draft your key STAR points and structural answers before your live interview round.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            rows={4}
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            placeholder="Outline your Situation, Task, Action, and Quantified Results..."
            className="w-full text-xs p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827] focus:outline-hidden"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => toast.success('Practice notes saved to your local session!')}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
