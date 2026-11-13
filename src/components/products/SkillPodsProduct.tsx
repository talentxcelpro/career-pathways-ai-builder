// src/components/products/SkillPodsProduct.tsx
// Independent Standalone Product for learning.talentxcel.in (SkillPods)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Filter, 
  Code2, 
  Brain, 
  Cloud, 
  Database, 
  ShieldCheck, 
  Check, 
  Play, 
  Zap, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { useCentralEntitlements } from '@/hooks/useCentralEntitlements';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

interface Question {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const ASSESSMENT_TRACKS: Record<string, {
  name: string;
  icon: typeof Code2;
  level: string;
  questions: Question[];
}> = {
  react: {
    name: 'Full-Stack React & Node',
    icon: Code2,
    level: 'Intermediate',
    questions: [
      {
        id: 1,
        prompt: 'In React 18 concurrent rendering, what happens when a state update is wrapped in startTransition?',
        options: [
          'It is executed synchronously before browser paint',
          'It is marked as non-urgent and can be interrupted by urgent updates like typing',
          'It converts the component to a Server Component',
          'It bypasses the virtual DOM completely'
        ],
        correctIndex: 1,
        explanation: 'startTransition marks updates as transitions, letting React prioritize urgent inputs like typing or clicking.'
      },
      {
        id: 2,
        prompt: 'Which HTTP header provides the strongest defense against Cross-Site Scripting (XSS)?',
        options: [
          'X-Frame-Options: DENY',
          'Access-Control-Allow-Origin: *',
          'Content-Security-Policy',
          'Strict-Transport-Security'
        ],
        correctIndex: 2,
        explanation: 'Content-Security-Policy (CSP) restricts the resources the browser is allowed to load and execute.'
      },
      {
        id: 3,
        prompt: 'What is the primary benefit of React Server Components (RSC)?',
        options: [
          'They eliminate the need for Node.js backends',
          'Zero client-side bundle size for server dependencies and direct backend data access',
          'They allow using browser DOM APIs on the server',
          'They run client-side state hooks on the edge'
        ],
        correctIndex: 1,
        explanation: 'RSC runs strictly on the server, transmitting only rendered JSON/HTML, keeping heavy libraries out of client JS.'
      }
    ]
  },
  ai: {
    name: 'Python & Generative AI',
    icon: Brain,
    level: 'Advanced',
    questions: [
      {
        id: 1,
        prompt: 'When building a Retrieval-Augmented Generation (RAG) system, why is semantic chunking preferred over fixed-character chunking?',
        options: [
          'It guarantees zero token consumption on the embedding model',
          'It preserves grammatical and conceptual context boundaries, reducing hallucination in retrieved context',
          'It removes the need for vector databases completely',
          'It encrypts chunks before saving to disk'
        ],
        correctIndex: 1,
        explanation: 'Semantic chunking divides documents based on logical meaning rather than arbitrary character counts, ensuring embeddings capture complete thoughts.'
      },
      {
        id: 2,
        prompt: 'In transformer architectures, what is the core purpose of Scaled Dot-Product Attention?',
        options: [
          'To compress the input tokens into an image tensor',
          'To compute weighted relevance between all tokens in a sequence simultaneously',
          'To eliminate backward propagation passes during training',
          'To generate audio spectrograms directly'
        ],
        correctIndex: 1,
        explanation: 'Attention allows each token to attend to every other token, weighting relevant semantic associations across long distances.'
      },
      {
        id: 3,
        prompt: 'What does LoRA (Low-Rank Adaptation) freeze during fine-tuning of large models?',
        options: [
          'The entire tokenizer vocabulary',
          'The pre-trained model weights, injecting small rank-decomposition matrices into attention layers',
          'The temperature and top-p sampling parameters',
          'The system prompt hyperparameter weights'
        ],
        correctIndex: 1,
        explanation: 'LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices, drastically reducing parameters.'
      }
    ]
  },
  cloud: {
    name: 'Cloud & DevOps Architecture',
    icon: Cloud,
    level: 'Professional',
    questions: [
      {
        id: 1,
        prompt: 'In Kubernetes, what is the key difference between a Deployment and a StatefulSet?',
        options: [
          'StatefulSets only run on Linux nodes',
          'Deployments provide unique persistent network identifiers and ordered scaling; StatefulSets do not',
          'StatefulSets provide persistent identities and stable network identifiers; Deployments are interchangeable',
          'Deployments do not support rolling updates'
        ],
        correctIndex: 2,
        explanation: 'StatefulSets maintain sticky identity for each pod with persistent storage bindings.'
      },
      {
        id: 2,
        prompt: 'Which AWS service provides serverless SQL querying directly over Parquet files in S3?',
        options: [
          'Amazon Redshift',
          'Amazon Athena',
          'Amazon RDS',
          'AWS Glue Catalog'
        ],
        correctIndex: 1,
        explanation: 'Amazon Athena is an interactive serverless query service using standard Presto/Trino SQL over S3 data lakes.'
      },
      {
        id: 3,
        prompt: 'What does a circuit breaker pattern prevent in distributed microservices?',
        options: [
          'Unauthorized SSL decryption',
          'Cascading service failures by short-circuiting calls to unhealthy downstream dependencies',
          'SQL injection in database queries',
          'Duplicate packet delivery over TCP'
        ],
        correctIndex: 1,
        explanation: 'Circuit breakers prevent an unresponsive service from overwhelming calling services and exhausting thread pools.'
      }
    ]
  }
};

const FEATURED_COURSES = [
  {
    id: 'c1',
    title: 'Full-Stack Next.js 14 & Supabase Architecture',
    track: 'Full-Stack React & Node',
    level: 'Intermediate',
    duration: '18 Hours',
    rating: '4.9',
    learners: '2,840',
    skills: ['Next.js', 'React Server Components', 'PostgreSQL', 'TailwindCSS'],
    isFree: true
  },
  {
    id: 'c2',
    title: 'Production RAG & LLM Application Engineering',
    track: 'Python & Generative AI',
    level: 'Advanced',
    duration: '24 Hours',
    rating: '4.95',
    learners: '3,120',
    skills: ['LangChain', 'pgvector', 'FastAPI', 'LlamaIndex', 'Evaluation'],
    isFree: true
  },
  {
    id: 'c3',
    title: 'Kubernetes, Terraform & Production CI/CD Pipelines',
    track: 'Cloud & DevOps Architecture',
    level: 'Professional',
    duration: '20 Hours',
    rating: '4.88',
    learners: '1,950',
    skills: ['Docker', 'K8s', 'GitHub Actions', 'AWS EKS', 'Prometheus'],
    isFree: true
  },
  {
    id: 'c4',
    title: 'High-Scale Data Streaming with Apache Kafka & Spark',
    track: 'Data Engineering',
    level: 'Advanced',
    duration: '22 Hours',
    rating: '4.91',
    learners: '1,420',
    skills: ['Kafka', 'PySpark', 'Delta Lake', 'Real-time Streaming'],
    isFree: true
  }
];

export const SkillPodsProduct: React.FC = () => {
  const navigate = useNavigate();
  const { 
    subscription, 
    checkEntitlement, 
    isUpgradeModalOpen, 
    openUpgradeModal, 
    closeUpgradeModal,
    refreshEntitlements 
  } = useCentralEntitlements();
  const [selectedTrack, setSelectedTrack] = useState<'react' | 'ai' | 'cloud'>('react');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrack = ASSESSMENT_TRACKS[selectedTrack];
  const currentQuestion = activeTrack.questions[currentQIndex];

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitQuestion = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);
    setUserAnswers(prev => [...prev, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < activeTrack.questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      setIsAssessmentComplete(true);
    }
  };

  const handleResetAssessment = () => {
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setUserAnswers([]);
    setIsAssessmentComplete(false);
  };

  const correctCount = userAnswers.reduce((acc, ans, idx) => {
    return ans === activeTrack.questions[idx]?.correctIndex ? acc + 1 : acc;
  }, 0);

  const scorePercent = Math.round((correctCount / activeTrack.questions.length) * 100);

  const filteredCourses = FEATURED_COURSES.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>SkillPods — Practical Skill Diagnostics & Peer Learning Hub | TalentXcel</title>
        <meta 
          name="description" 
          content="Test your engineering skills with instant interactive technical assessments. Earn verified credentials, join learning pods, and bridge straight to job interviews." 
        />
        <link rel="canonical" href="https://learning.talentxcel.in/" />
      </Helmet>

      {/* Shared Global Product Header */}
      <ProductHeader 
        productName="SkillPods" 
        activeNav="learning"
        badgeLabel="Technical Skill Diagnostics"
        topBannerText="Free Practical Technical Assessments & Direct Bridge to Career Passport"
        primaryActionLabel="Claim Learning Profile"
        primaryActionTo="/auth/register?intent=learning"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-16">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Interactive Technical Skill Diagnostics</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Prove Your Skills in 5 Minutes. <br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
                Skip The Resume Queue.
              </span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Take verified practical assessments designed by lead architects. Pass with &gt;70% to earn a verified credential on your <strong className="text-[#111827]">Career Passport</strong> that recruiters inspect directly.
            </p>

            {/* Interactive Assessment Tool */}
            <div className="mt-8 max-w-3xl mx-auto text-left">
              <Card className="bg-white border-[#E2E8F0] text-[#111827] shadow-lg shadow-blue-900/5 rounded-3xl p-4 sm:p-6">
                <CardHeader className="border-b border-[#E2E8F0] pb-4 px-0 pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#111827] flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#2563EB]" />
                        Live Technical Diagnostic
                      </CardTitle>
                      <CardDescription className="text-xs text-[#64748B]">
                        Interactive engineering questions with weighted category evaluation
                      </CardDescription>
                    </div>

                    {/* Track Selector Tabs */}
                    <div className="flex items-center gap-1.5 bg-[#F4F7FC] p-1.5 rounded-2xl border border-[#E2E8F0] text-xs">
                      {(['react', 'ai', 'cloud'] as const).map(trackKey => {
                        const track = ASSESSMENT_TRACKS[trackKey];
                        const Icon = track.icon;
                        const isActive = selectedTrack === trackKey;
                        return (
                          <button
                            key={trackKey}
                            onClick={() => {
                              setSelectedTrack(trackKey);
                              handleResetAssessment();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs'
                                : 'text-[#64748B] hover:text-[#111827]'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{track.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6 px-0 pb-0">
                  {!isAssessmentComplete ? (
                    <>
                      {/* Progress & Meta */}
                      <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
                        <span>Question {currentQIndex + 1} of {activeTrack.questions.length}</span>
                        <Badge variant="outline" className="text-[#2563EB] border-blue-200 bg-blue-50 text-[10px] font-bold">
                          {activeTrack.level} Track
                        </Badge>
                      </div>
                      <Progress value={((currentQIndex) / activeTrack.questions.length) * 100} className="h-2 bg-[#F4F7FC]" />

                      {/* Question Prompt */}
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-relaxed">
                          {currentQuestion.prompt}
                        </h3>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {currentQuestion.options.map((option, idx) => {
                            const isChosen = selectedAnswer === idx;
                            const isCorrect = currentQuestion.correctIndex === idx;

                            let style = 'bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] hover:border-[#2563EB]';
                            if (isChosen && !submitted) {
                              style = 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-2xs';
                            } else if (submitted) {
                              if (isCorrect) {
                                style = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                              } else if (isChosen && !isCorrect) {
                                style = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectOption(idx)}
                                className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${style}`}
                              >
                                <span className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 leading-snug">{option}</span>
                                {submitted && isCorrect && (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation feedback */}
                      {submitted && (
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#111827] space-y-1">
                          <p className="font-bold text-[#2563EB] flex items-center gap-1.5">
                            <Brain className="h-4 w-4 text-[#2563EB]" />
                            Architect Explanation:
                          </p>
                          <p className="text-[#64748B]">{currentQuestion.explanation}</p>
                        </div>
                      )}

                      {/* Action Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetAssessment}
                          className="text-xs text-[#64748B] hover:text-[#111827]"
                        >
                          Reset Test
                        </Button>

                        {!submitted ? (
                          <Button
                            size="sm"
                            onClick={handleSubmitQuestion}
                            disabled={selectedAnswer === null}
                            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
                          >
                            Submit Answer
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={handleNextQuestion}
                            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                          >
                            {currentQIndex + 1 < activeTrack.questions.length ? 'Next Question' : 'View Full Diagnostic'}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Assessment Completed Summary */
                    <div className="py-6 text-center space-y-6">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                        <Award className="h-8 w-8" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-black text-[#111827]">Diagnostic Completed!</h3>
                        <p className="text-xs text-[#64748B]">
                          Track: <strong className="text-[#111827]">{activeTrack.name}</strong> • Level: <strong className="text-[#2563EB]">{activeTrack.level}</strong>
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto p-5 rounded-2xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-3">
                        <div className="text-4xl font-black text-[#111827]">{scorePercent}%</div>
                        <p className="text-xs text-[#64748B]">
                          {scorePercent >= 70 
                            ? '🔥 Qualified! Your score is in the top 15th percentile of applicants.'
                            : 'Review recommendations below to strengthen core architecture concepts.'}
                        </p>
                        <Progress value={scorePercent} className="h-2 bg-slate-200" />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                          size="sm"
                          onClick={() => navigate('/auth/register?intent=learning_score')}
                          className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
                        >
                          Sync Badge to Career Passport →
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetAssessment}
                          className="border-[#E2E8F0] text-[#64748B] hover:text-[#111827] text-xs rounded-xl"
                        >
                          Retake Assessment
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Practical Courses Directory */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827] flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#2563EB]" />
                Practical Course Tracks & Skill Pods
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                Architect-reviewed pathways with real GitHub repositories and zero fluff.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
              <Input
                type="text"
                placeholder="Search skills, Docker, RAG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-[#E2E8F0] text-xs text-[#111827] placeholder:text-[#64748B] rounded-xl h-10 shadow-xs"
              />
            </div>
          </div>

          {/* Grid of Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="bg-white border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl shadow-xs hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] text-[#2563EB] border-blue-200 bg-blue-50 font-bold">
                      {course.track}
                    </Badge>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Free Access
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-[#111827] hover:text-[#2563EB] transition-colors cursor-pointer">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {course.skills.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#F4F7FC] text-[#64748B] font-mono border border-[#E2E8F0]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#64748B] pt-3 border-t border-[#E2E8F0] font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#64748B]" />
                        {course.learners} learners
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate('/auth/register?intent=course_enroll')}
                      className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs"
                    >
                      Start Track →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Shared Global Product Footer */}
      <ProductFooter currentProduct="SkillPods" />

      {/* Central Revenue Pro Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlanId={subscription.planId}
        targetFeatureName="Verifiable Skill Credentials & Pro Learning Tracks"
        onSuccess={() => {
          refreshEntitlements();
        }}
      />
    </div>
  );
};
