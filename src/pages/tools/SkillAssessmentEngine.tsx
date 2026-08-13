import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BookOpen, Clock, Target, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// This is a REWRITE of the old self-report survey. Key differences, and why:
//
// 1. Questions come from start-skill-assessment (server strips correct_answer
//    before sending) — the client never has the answer key to work with.
// 2. Scoring happens in submit-skill-assessment. There is no client-side
//    score computation anywhere in this file, and no hardcoded fallback
//    score if a network call fails — a failed grading call shows an error,
//    it does not silently award a score.
// 3. A real countdown timer enforces the time limit client-side for UX, but
//    the server independently checks elapsed time from `started_at`, so a
//    paused/resumed tab can't extend the real deadline.
// 4. Tab-visibility changes and per-question answer speed are tracked and
//    sent as integrity signals. They don't block submission — they get
//    surfaced as flags on the result instead of a silent pass/fail.
// 5. Once an answer is submitted for a question, you cannot go back and
//    change it — this isn't a survey you can revise after reflecting, it's
//    a test.
// ---------------------------------------------------------------------------

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
}

interface StartResponse {
  success: boolean;
  attempt_id: string;
  started_at: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  questions: Question[];
  error?: string;
}

interface SubmitResponse {
  success: boolean;
  score: number;
  category_scores: Record<string, number>;
  passed: boolean;
  integrity_flags: string[];
  review: Array<{
    id: number;
    category: string;
    question: string;
    options: string[];
    submitted_answer: number | null;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
  }>;
  error?: string;
}

const SkillAssessmentEngine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState<'intro' | 'loading' | 'in_progress' | 'grading' | 'results' | 'error'>('intro');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ title: string; description: string; timeLimitMinutes: number; passingScore: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timePerQuestion, setTimePerQuestion] = useState<Record<number, number>>({});
  const [tabBlurCount, setTabBlurCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  const questionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track tab-blur as a lightweight integrity signal, not a blocker.
  useEffect(() => {
    if (phase !== 'in_progress') return;
    const handleVisibility = () => {
      if (document.hidden) setTabBlurCount((c) => c + 1);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  // Countdown timer. Triggers auto-submit when it hits zero.
  const handleAutoSubmit = useCallback(() => {
    if (phase === 'in_progress') {
      submitAssessment();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'in_progress' || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return sec - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, secondsRemaining, handleAutoSubmit]);

  const startAssessment = async () => {
    if (!user) {
      toast.error('You must be signed in to take an assessment');
      return;
    }

    setPhase('loading');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.functions.invoke<StartResponse>('start-skill-assessment', {
        body: {},
      });

      if (error || !data || !data.success) {
        const msg = data?.error || error?.message || 'Failed to start assessment';
        setErrorMessage(msg);
        setPhase('error');
        return;
      }

      setAttemptId(data.attempt_id);
      setMeta({
        title: data.title,
        description: data.description,
        timeLimitMinutes: data.time_limit_minutes,
        passingScore: data.passing_score,
      });
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setTimePerQuestion({});
      setTabBlurCount(0);
      setSecondsRemaining(data.time_limit_minutes * 60);

      questionStartRef.current = Date.now();
      setPhase('in_progress');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error starting assessment';
      setErrorMessage(msg);
      setPhase('error');
    }
  };

  const recordCurrentQuestionTime = () => {
    const q = questions[currentIndex];
    if (!q) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    setTimePerQuestion((prev) => ({ ...prev, [q.id]: (prev[q.id] || 0) + elapsed }));
  };

  const handleSelectOption = (optionIndex: number) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
  };

  const handleNextQuestion = () => {
    recordCurrentQuestionTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      questionStartRef.current = Date.now();
    }
  };

  const submitAssessment = async () => {
    recordCurrentQuestionTime();
    if (!attemptId) return;

    setPhase('grading');

    try {
      const { data, error } = await supabase.functions.invoke<SubmitResponse>('submit-skill-assessment', {
        body: {
          attempt_id: attemptId,
          answers,
          time_per_question_seconds: timePerQuestion,
          tab_blur_count: tabBlurCount,
        },
      });

      if (error || !data || !data.success) {
        const msg = data?.error || error?.message || 'Grading request failed';
        setErrorMessage(msg);
        setPhase('error');
        return;
      }

      setResult(data);
      setPhase('results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting assessment';
      setErrorMessage(msg);
      setPhase('error');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ---------------------------------------------------------------------------
  // RENDER: Intro
  // ---------------------------------------------------------------------------
  if (phase === 'intro') {
    return (
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tools')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tools
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Server-Graded & Objectively Timed
              </Badge>
            </div>
            <CardTitle className="text-2xl mt-2">Core Technical Skill Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              This is a real, gradeable technical assessment. Unlike self-evaluation forms, every question has an objective right answer. Your score reflects actual performance, and is saved directly to your TalentXcel profile upon passing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50 border">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">Time Limit</div>
                  <div className="text-xs text-muted-foreground">15 minutes</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50 border">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">Passing Score</div>
                  <div className="text-xs text-muted-foreground">80% required for badge</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50 border">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">Max Attempts</div>
                  <div className="text-xs text-muted-foreground">3 attempts total</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-700" /> Assessment Rules
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                <li>Once started, the timer cannot be paused.</li>
                <li>Questions are scored server-side after submission. Answer explanations are revealed at the end.</li>
                <li>Switching tabs or windows is logged as an integrity signal on your attempt summary.</li>
              </ul>
            </div>

            <Button size="lg" className="w-full md:w-auto" onClick={startAssessment}>
              Start Assessment Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Loading / Grading
  // ---------------------------------------------------------------------------
  if (phase === 'loading' || phase === 'grading') {
    return (
      <div className="container mx-auto py-16 max-w-lg text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">
          {phase === 'loading' ? 'Fetching assessment questions...' : 'Grading assessment server-side...'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {phase === 'loading' ? 'Stripping client-side answer key...' : 'Checking correct answers & calculating objective score...'}
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Error
  // ---------------------------------------------------------------------------
  if (phase === 'error') {
    return (
      <div className="container mx-auto py-8 max-w-xl space-y-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-6 w-6" /> Assessment Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{errorMessage || 'An unexpected error occurred.'}</p>
            <Button onClick={() => setPhase('intro')}>Return to Assessment Overview</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: In Progress
  // ---------------------------------------------------------------------------
  if (phase === 'in_progress') {
    const currentQ = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
    const selectedAnswerIndex = answers[currentQ?.id];

    return (
      <div className="container mx-auto py-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className={`font-mono text-sm font-semibold px-3 py-1 rounded border ${secondsRemaining < 120 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            Time Remaining: {formatSeconds(secondsRemaining)}
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        {currentQ && (
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2">
                {currentQ.category}
              </Badge>
              <CardTitle className="text-lg font-medium leading-relaxed">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedAnswerIndex !== undefined ? String(selectedAnswerIndex) : ''}
                onValueChange={(val) => handleSelectOption(parseInt(val, 10))}
                className="space-y-3"
              >
                {currentQ.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnswerIndex === idx ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleSelectOption(idx)}
                  >
                    <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                    <Label htmlFor={`opt-${idx}`} className="cursor-pointer font-normal text-sm flex-grow">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end pt-4 border-t">
                {isLastQuestion ? (
                  <Button onClick={submitAssessment} disabled={selectedAnswerIndex === undefined}>
                    Submit Assessment for Grading
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} disabled={selectedAnswerIndex === undefined}>
                    Next Question
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Results
  // ---------------------------------------------------------------------------
  if (phase === 'results' && result) {
    return (
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        <Card className={result.passed ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200 bg-amber-50/20'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {result.passed ? (
                    <span className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-6 w-6" /> Assessment Passed!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-6 w-6" /> Assessment Completed
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.passed
                    ? 'Congratulations — your verified score has been recorded to your Career Passport.'
                    : 'You did not meet the 80% threshold required for a verified skill badge. Review answer details below before re-attempting.'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-4xl font-extrabold text-foreground">{result.score}%</div>
                <div className="text-xs text-muted-foreground">Objective Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.integrity_flags.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                <span className="font-semibold">Integrity signals noted on submission:</span>{' '}
                {result.integrity_flags.join(', ')}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(result.category_scores).map(([category, catScore]) => (
                <div key={category} className="p-4 bg-white rounded-lg border space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</div>
                  <div className="text-2xl font-bold">{catScore}%</div>
                  <Progress value={catScore} className="h-1.5" />
                </div>
              ))}
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Question Review & Explanations</h3>

              {result.review.map((item, idx) => (
                <Card key={item.id} className={item.is_correct ? 'border-emerald-200' : 'border-red-200'}>
                  <CardHeader className="py-3 px-4 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Question {idx + 1} • {item.category}</span>
                      <Badge variant={item.is_correct ? 'default' : 'destructive'} className="text-[10px]">
                        {item.is_correct ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-medium">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4 space-y-2 text-xs">
                    <div className="space-y-1">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = item.submitted_answer === optIdx;
                        const isAnswerKey = item.correct_answer === optIdx;

                        let style = 'bg-slate-50 border-slate-200';
                        if (isAnswerKey) style = 'bg-emerald-50 border-emerald-300 font-medium text-emerald-900';
                        if (isChosen && !isAnswerKey) style = 'bg-red-50 border-red-300 font-medium text-red-900';

                        return (
                          <div key={optIdx} className={`p-2 rounded border flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isAnswerKey && <span className="text-[10px] text-emerald-700 font-bold">✓ Correct Answer</span>}
                            {isChosen && !isAnswerKey && <span className="text-[10px] text-red-700 font-bold">✕ Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded text-blue-950 mt-2">
                        <span className="font-semibold">Explanation:</span> {item.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={() => setPhase('intro')} variant="outline">
                Back to Assessment Home
              </Button>
              <Button onClick={() => navigate('/passport')}>
                View Updated Career Passport
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SkillAssessmentEngine;