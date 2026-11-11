// src/components/products/SkillPodsProduct.tsx
// Independent Standalone Product for learning.talentxcel.in (SkillPods)

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
        prompt: 'In Retrieval-Augmented Generation (RAG), what is the function of vector embeddings?',
        options: [
          'Encrypting user prompts before sending to the model API',
          'Representing chunks of text as high-dimensional coordinates to enable semantic search',
          'Compressing token size to reduce API costs',
          'Fine-tuning model weights dynamically during inference'
        ],
        correctIndex: 1,
        explanation: 'Embeddings map text to coordinate vectors where semantic similarity corresponds to geometric proximity (cosine distance).'
      },
      {
        id: 2,
        prompt: 'What does temperature parameter control in LLM inference?',
        options: [
          'The GPU cooling fan speed during decoding',
          'The randomness and entropy of token probability distribution',
          'The strict timeout for generation in milliseconds',
          'The context window capacity limit'
        ],
        correctIndex: 1,
        explanation: 'Lower temperature sharpens probability around high-likelihood tokens (deterministic); higher temperature increases diversity.'
      },
      {
        id: 3,
        prompt: 'When fine-tuning using LoRA (Low-Rank Adaptation), what is optimized?',
        options: [
          'All full-rank weight matrices of the base transformer',
          'Small trainable rank-decomposition matrices injected into transformer layers',
          'Only the token embedding lookup table',
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
    if (selectedAnswer === null) {
      toast.error('Please select an answer first.');
      return;
    }
    setSubmitted(true);
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...userAnswers, selectedAnswer!];
    setUserAnswers(updatedAnswers);
    setSelectedAnswer(null);
    setSubmitted(false);

    if (currentQIndex + 1 < activeTrack.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
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

  // Calculate score
  const correctCount = userAnswers.reduce((acc, ans, idx) => {
    return ans === activeTrack.questions[idx].correctIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((correctCount / activeTrack.questions.length) * 100);

  const filteredCourses = FEATURED_COURSES.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      <Helmet>
        <title>SkillPods — Practical Skill Diagnostics & Peer Learning Hub | TalentXcel</title>
        <meta 
          name="description" 
          content="Test your engineering skills with instant interactive technical assessments. Earn verified credentials, join learning pods, and bridge straight to job interviews." 
        />
        <link rel="canonical" href="https://learning.talentxcel.in/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "TalentXcel SkillPods",
            "url": "https://learning.talentxcel.in/",
            "description": "Practical technical assessments, peer learning pods, and verifiable skills credentials."
          })}
        </script>
      </Helmet>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="border-b border-purple-900/40 bg-purple-950/30 backdrop-blur px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] uppercase font-bold tracking-wider">
              SkillPods Engine
            </Badge>
            <span className="text-slate-400 hidden sm:inline">• Free practical technical assessments & direct bridge to Career Passport</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate('/auth/register?intent=learning')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg px-3 py-1 h-7"
            >
              Claim Learning Profile →
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Interactive Technical Skill Diagnostics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Prove Your Skills in 5 Minutes. <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Skip The Resume Queue.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Take verified practical assessments designed by lead architects. Pass with &gt;80% to earn a cryptographic badge on your <strong className="text-white">Career Passport</strong> that verified recruiters inspect directly.
          </p>
        </div>

        {/* INTERACTIVE ASSESSMENT TOOL */}
        <div className="mt-10 max-w-4xl mx-auto">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl backdrop-blur">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-400" />
                    Live Technical Diagnostic
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Interactive engineering questions with weighted category evaluation
                  </CardDescription>
                </div>

                {/* Track Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
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

            <CardContent className="pt-6 space-y-6">
              {!isAssessmentComplete ? (
                <>
                  {/* Progress & Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Question {currentQIndex + 1} of {activeTrack.questions.length}</span>
                    <Badge variant="outline" className="text-purple-400 border-purple-800/60 text-[10px]">
                      {activeTrack.level} Track
                    </Badge>
                  </div>
                  <Progress value={((currentQIndex) / activeTrack.questions.length) * 100} className="h-1.5 bg-slate-800" />

                  {/* Question Prompt */}
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                      {currentQuestion.prompt}
                    </h3>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQuestion.options.map((option, idx) => {
                        const isChosen = selectedAnswer === idx;
                        const isCorrect = currentQuestion.correctIndex === idx;

                        let style = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700';
                        if (isChosen && !submitted) {
                          style = 'bg-purple-950/40 border-purple-500 text-white shadow-xs';
                        } else if (submitted) {
                          if (isCorrect) {
                            style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                          } else if (isChosen && !isCorrect) {
                            style = 'bg-rose-950/40 border-rose-500 text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${style}`}
                          >
                            <span className="h-5 w-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1 leading-snug">{option}</span>
                            {submitted && isCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation feedback */}
                  {submitted && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 space-y-1 animate-fadeIn">
                      <p className="font-bold flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-purple-400" />
                        Architect Explanation:
                      </p>
                      <p className="text-slate-300">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetAssessment}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Reset Test
                    </Button>

                    {!submitted ? (
                      <Button
                        size="sm"
                        onClick={handleSubmitQuestion}
                        disabled={selectedAnswer === null}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 rounded-xl"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 rounded-xl flex items-center gap-1.5"
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
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Award className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Diagnostic Completed!</h3>
                    <p className="text-xs text-slate-300">
                      Track: <strong className="text-white">{activeTrack.name}</strong> • Level: <strong className="text-purple-400">{activeTrack.level}</strong>
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-4xl font-black text-white">{scorePercent}%</div>
                    <p className="text-xs text-slate-400">
                      {scorePercent >= 70 
                        ? '🔥 Qualified! Your score is in the top 15th percentile of applicants.'
                        : 'Review recommendations below to strengthen core architecture concepts.'}
                    </p>
                    <Progress value={scorePercent} className="h-2 bg-slate-800" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      size="sm"
                      onClick={() => navigate('/auth/register?intent=learning_score')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2 rounded-xl"
                    >
                      Sync Badge to Career Passport →
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetAssessment}
                      className="border-slate-800 text-slate-300 hover:text-white text-xs"
                    >
                      Retake Assessment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PRACTICAL COURSES DIRECTORY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-400" />
              Practical Course Tracks & Skill Pods
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Architect-reviewed pathways with real GitHub repositories and zero fluff.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search skills, Docker, RAG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>
        </div>

        {/* Grid of Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-purple-500/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-800/60">
                    {course.track}
                  </Badge>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    Free Access
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-white hover:text-purple-300 transition-colors cursor-pointer">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {course.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      {course.learners} learners
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate('/auth/register?intent=course_enroll')}
                    className="bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs h-7 rounded-lg"
                  >
                    Start Track →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SIBLING ECOSYSTEM STRIP */}
      <section className="py-8 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TalentXcel SkillPods. Part of the TalentXcel Career Ecosystem.</p>
          <div className="flex flex-wrap gap-4 font-semibold text-slate-300">
            <a href="https://jobs.talentxcel.in" className="hover:text-white">JobMatch OS</a>
            <a href="https://resume.talentxcel.in" className="hover:text-white">ResumeStudio</a>
            <a href="https://salary.talentxcel.in" className="hover:text-white">PayScale</a>
            <a href="https://passport.talentxcel.in" className="hover:text-white">Career Passport</a>
          </div>
        </div>
      </section>
    </div>
  );
};
