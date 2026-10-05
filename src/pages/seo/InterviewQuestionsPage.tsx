import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  CheckCircle2, 
  Code2, 
  Sparkles, 
  Target, 
  ArrowRight, 
  BookOpen, 
  BrainCircuit, 
  Briefcase, 
  ShieldCheck, 
  TrendingUp,
  Building
} from 'lucide-react';

interface QuestionItem {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'system_design' | 'situational';
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  starAnswer?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  codeSnippet?: {
    language: string;
    code: string;
  };
  keyTakeaways: string[];
}

const DEFAULT_INTERVIEW_QUESTIONS: Record<string, QuestionItem[]> = {
  default: [
    {
      id: 'q1',
      question: 'How do you design a high-throughput, low-latency API caching layer under unpredictable traffic spikes?',
      category: 'system_design',
      difficulty: 'Senior',
      starAnswer: {
        situation: 'Our checkout API experienced 12x traffic surges during seasonal flash sales, causing database CPU spikes above 95% and request timeouts.',
        task: 'I was tasked with architecting a resilient multi-tier caching strategy that guaranteed sub-20ms p99 latency without stale data anomalies.',
        action: 'I deployed a two-tier caching architecture: in-memory local caching (Guava/LRU) backed by a clustered Redis cluster with write-around invalidation, randomized TTL jitter to eliminate cache stampedes, and single-flight request coalescing.',
        result: 'Reduced database queries by 84%, slashed p99 latency from 450ms to 14ms, and successfully handled 45,000 requests/sec with zero downtime.'
      },
      codeSnippet: {
        language: 'typescript',
        code: `// Redis Multi-Tier Cache with Jitter & Mutex Lock
async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttlSec: number): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 5);
  
  if (acquired) {
    try {
      const freshData = await fetcher();
      const jitter = Math.floor(Math.random() * 60);
      await redis.set(key, JSON.stringify(freshData), 'EX', ttlSec + jitter);
      return freshData;
    } finally {
      await redis.del(lockKey);
    }
  }
  
  // Wait and retry for lock holder to populate
  await new Promise(r => setTimeout(r, 100));
  return getCachedData(key, fetcher, ttlSec);
}`
      },
      keyTakeaways: [
        'Avoid cache stampedes by introducing TTL jitter.',
        'Protect primary datastore using distributed mutex locks or single-flight coalescing.',
        'Distinguish between eventual consistency and strict read-after-write consistency.'
      ]
    },
    {
      id: 'q2',
      question: 'Explain the difference between Optimistic Concurrency Control and Pessimistic Locking in high-concurrency databases.',
      category: 'technical',
      difficulty: 'Mid',
      starAnswer: {
        situation: 'Two simultaneous users were purchasing the final remaining inventory item in an e-commerce platform, leading to race-condition overselling.',
        task: 'Determine whether to implement row-level pessimistic locking (SELECT FOR UPDATE) or optimistic version numbers.',
        action: 'Analyzed read/write ratios: since reads were 98% and conflicting concurrent checkouts were <2%, I implemented optimistic version tagging (WHERE version = @old_version) with automatic retry backoff rather than blocking database threads with locks.',
        result: 'Eliminated deadlocks, maintained 99.99% transaction integrity, and supported 3x higher concurrent user checkout throughput.'
      },
      codeSnippet: {
        language: 'sql',
        code: `-- Optimistic Locking Query with Version Invariant
UPDATE product_inventory 
SET available_units = available_units - 1, 
    version = version + 1,
    updated_at = NOW()
WHERE product_id = :productId 
  AND version = :expectedVersion 
  AND available_units >= 1;`
      },
      keyTakeaways: [
        'Optimistic locking works best when conflict probability is low.',
        'Pessimistic locking prevents retries but risks deadlocks and queue contention.',
        'Always check affected row counts when committing optimistic updates.'
      ]
    },
    {
      id: 'q3',
      question: 'Tell me about a time you had a technical disagreement with a senior teammate or tech lead. How did you resolve it?',
      category: 'behavioral',
      difficulty: 'Mid',
      starAnswer: {
        situation: 'During our microservices migration, our lead proposed migrating our monolithic reporting system to a distributed GraphQL federation, while I favored asynchronous event-driven materialized views.',
        task: 'I needed to voice my architectural and latency concerns constructively without disrupting sprint deadlines or team cohesion.',
        action: 'Instead of debating opinion, I built a quick 2-day proof of concept measuring network hop latency, serialization overhead, and debugging complexity under simulated production traffic. I presented the quantitative telemetry during our tech review.',
        result: 'The team collectively agreed that materialized views saved 6 weeks of development overhead and 30ms latency. The lead commended the objective, data-backed approach.'
      },
      keyTakeaways: [
        'Decouple emotional ego from technical architecture decisions.',
        'Use objective empirical benchmarks (POCs) rather than rhetoric.',
        'Commit fully to the consensus once the team makes a final decision.'
      ]
    },
    {
      id: 'q4',
      question: 'How do you prevent and remediate memory leaks in long-running Node.js or JavaScript services?',
      category: 'technical',
      difficulty: 'Senior',
      starAnswer: {
        situation: 'Our production background worker pods were steadily climbing from 200MB to 1.8GB memory usage every 48 hours, triggering OOM (Out Of Memory) Kubernetes eviction loops.',
        task: 'Identify the exact root cause of heap retention and eliminate the memory accumulation without restarting pods on cron.',
        action: 'Captured heap snapshots using v8-profiler and Chrome DevTools under simulated load. Traced the leak to unbounded EventEmitter listeners attached inside per-request database retry loops and uncollected closure references.',
        result: 'Fixed the subscription cleanup in a finally block, capping baseline container memory at 180MB flat over 30 days of continuous traffic.'
      },
      keyTakeaways: [
        'Inspect retained heap sizes vs shallow sizes using Chrome DevTools or Clinic.js.',
        'Check for unremoved event listeners, global caches, and unclosed database streams.',
        'Set up automated memory usage alerting in Prometheus/Grafana.'
      ]
    },
    {
      id: 'q5',
      question: 'Describe your approach to breaking a complex feature into iterative, non-breaking continuous deployments.',
      category: 'behavioral',
      difficulty: 'Junior',
      starAnswer: {
        situation: 'We were tasked with replacing our user authentication system with OAuth2 and passkeys across 400,000 active candidates.',
        task: 'Deliver the feature without any scheduled downtime or breaking active mobile app sessions.',
        action: 'Adopted the Strangler Fig pattern with LaunchDarkly feature flags. Introduced the new auth endpoints behind a canary 5% traffic flag, ran dual-writes for password verification, and progressively scaled traffic to 100% over 10 days.',
        result: 'Successfully rolled out passkey authentication with zero user login drop-offs and instant rollback capability intact throughout.'
      },
      keyTakeaways: [
        'Utilize feature flags to decouple code deployment from release.',
        'Apply the Strangler Fig pattern to replace legacy systems incrementally.',
        'Monitor synthetic error rates during phased percentage rollouts.'
      ]
    },
    {
      id: 'q6',
      question: 'What is database indexing and what are the trade-offs of B-Tree vs Hash vs GIN indexes?',
      category: 'technical',
      difficulty: 'Junior',
      keyTakeaways: [
        'B-Trees are the default; they excel at range queries (<, >, BETWEEN) and equality.',
        'Hash indexes only support exact equality (=) and do not support range sorting.',
        'GIN (Generalized Inverted Index) is optimized for composite types, JSONB documents, and full-text search.'
      ]
    },
    {
      id: 'q7',
      question: 'How do you handle schema migrations on high-volume production tables without locking reads or writes?',
      category: 'technical',
      difficulty: 'Senior',
      keyTakeaways: [
        'Never run ADD COLUMN with a dynamic non-null default without validating PostgreSQL version semantics.',
        'Create indexes concurrently (CREATE INDEX CONCURRENTLY) to avoid holding exclusive table locks.',
        'Use expand-and-contract migration steps across separate sprint releases.'
      ]
    },
    {
      id: 'q8',
      question: 'Tell me about a high-severity production outage you managed. How did you triage and post-mortem it?',
      category: 'behavioral',
      difficulty: 'Lead',
      keyTakeaways: [
        'Immediate goal during an incident is mitigation and customer blast radius reduction, not root cause debate.',
        'Maintain a blameless post-mortem culture focusing on procedural safeguards.',
        'Generate concrete action items (runbooks, alerts, unit tests) to prevent recurrence.'
      ]
    },
    {
      id: 'q9',
      question: 'Explain CORS (Cross-Origin Resource Sharing) and why a preflight OPTIONS request occurs.',
      category: 'technical',
      difficulty: 'Junior',
      keyTakeaways: [
        'CORS is a browser security mechanism, not a server security boundary.',
        'Preflight OPTIONS requests are triggered when requests use non-simple HTTP methods or custom headers (like Authorization).',
        'Ensure the Access-Control-Allow-Origin header matches the calling origin or credentials policy.'
      ]
    },
    {
      id: 'q10',
      question: 'How do you prioritize tech debt alongside urgent business-driven product roadmap features?',
      category: 'behavioral',
      difficulty: 'Senior',
      keyTakeaways: [
        'Frame tech debt in terms of business impact: customer churn risk, developer velocity drag, and infrastructure spend.',
        'Allocate a predictable 15-20% engineering capacity per sprint for maintenance and upgrades.',
        'Tie architectural improvements directly to upcoming roadmap deliverables.'
      ]
    }
  ]
};

export const InterviewQuestionsPage: React.FC = () => {
  const { role: roleParam } = useParams<{ role?: string }>();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'technical' | 'behavioral' | 'system_design'>('all');

  const formattedRole = roleParam 
    ? roleParam.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Software Engineer';

  const questions = DEFAULT_INTERVIEW_QUESTIONS[roleParam || ''] || DEFAULT_INTERVIEW_QUESTIONS.default;

  const filteredQuestions = selectedFilter === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedFilter);

  const pageTitle = `${formattedRole} Interview Questions & STAR Model Answers (2026) | TalentXcel`;
  const pageDescription = `Top 50+ ${formattedRole} interview questions asked at Google, Amazon, Microsoft, and high-growth startups. Includes verified STAR answer frameworks, system design breakdowns, and live code examples.`;
  const canonicalUrl = roleParam 
    ? `https://talentxcel.in/interview-questions/${roleParam}`
    : `https://talentxcel.in/interview-questions`;

  // Schema.org FAQPage Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.slice(0, 10).map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.starAnswer 
          ? `Situation: ${q.starAnswer.situation} Task: ${q.starAnswer.task} Action: ${q.starAnswer.action} Result: ${q.starAnswer.result}`
          : q.keyTakeaways.join(' ')
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-border/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              <BrainCircuit className="h-3.5 w-3.5 mr-1" />
              Verified Interview Intelligence
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Updated for 2026 Tech Hiring
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {formattedRole} Interview Questions & Answers
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-3xl">
            Real questions asked during technical and behavioral rounds at tier-1 technology companies. 
            Study complete STAR responses, code implementations, and key evaluation rubrics.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link to="/tools/mock-interview-simulator">
                <Sparkles className="h-4 w-4 mr-2" />
                Practice with AI Mock Interview
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/resume/ats-check/${roleParam || 'software-engineer'}`}>
                <Target className="h-4 w-4 mr-2" />
                Audit Resume for {formattedRole}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to={`/salary/${roleParam || 'software-engineer'}`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {formattedRole} Salary Trends
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filters */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex gap-2 overflow-x-auto">
            <Button 
              variant={selectedFilter === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('all')}
            >
              All Questions ({questions.length})
            </Button>
            <Button 
              variant={selectedFilter === 'technical' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('technical')}
            >
              Technical
            </Button>
            <Button 
              variant={selectedFilter === 'system_design' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('system_design')}
            >
              System Design
            </Button>
            <Button 
              variant={selectedFilter === 'behavioral' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('behavioral')}
            >
              Behavioral & STAR
            </Button>
          </div>
        </div>

        {/* Question Cards Accordion */}
        <Accordion type="single" collapsible defaultValue="q1" className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <AccordionItem 
              key={q.id} 
              value={q.id} 
              className="border border-border/80 rounded-xl bg-card px-5 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-3">
                  <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {q.question}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 sm:mt-0 sm:ml-auto shrink-0">
                    <Badge variant="secondary" className="text-[11px] capitalize">
                      {q.category.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[11px] ${
                        q.difficulty === 'Senior' || q.difficulty === 'Lead' 
                          ? 'border-purple-300 text-purple-600 dark:text-purple-400' 
                          : 'border-blue-300 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-2 pb-6 space-y-4 border-t border-border/60">
                {/* STAR Breakdown */}
                {q.starAnswer && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border border-border/60 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4" />
                      Recommended STAR Response Framework
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-card rounded border">
                        <span className="font-semibold text-primary block text-xs">Situation:</span>
                        <p className="text-muted-foreground mt-1 text-xs">{q.starAnswer.situation}</p>
                      </div>
                      <div className="p-3 bg-card rounded border">
                        <span className="font-semibold text-primary block text-xs">Task:</span>
                        <p className="text-muted-foreground mt-1 text-xs">{q.starAnswer.task}</p>
                      </div>
                      <div className="p-3 bg-card rounded border">
                        <span className="font-semibold text-primary block text-xs">Action:</span>
                        <p className="text-muted-foreground mt-1 text-xs">{q.starAnswer.action}</p>
                      </div>
                      <div className="p-3 bg-card rounded border">
                        <span className="font-semibold text-primary block text-xs">Result:</span>
                        <p className="text-foreground font-medium mt-1 text-xs">{q.starAnswer.result}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Solution */}
                {q.codeSnippet && (
                  <div className="rounded-lg bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Code2 className="h-3.5 w-3.5" />
                        Live Implementation Snippet ({q.codeSnippet.language})
                      </span>
                    </div>
                    <pre>
                      <code>{q.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Key Takeaways */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Key Evaluation Rubrics:
                  </h4>
                  <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                    {q.keyTakeaways.map((point, kIdx) => (
                      <li key={kIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Cross-Universe Authority Footer */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Explore Related Roles & Preparation Guides</CardTitle>
            <CardDescription>Comprehensive search destinations across engineering, cloud, and product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Link 
                to="/interview-questions/data-scientist"
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>Data Scientist</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to="/interview-questions/devops-engineer"
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>DevOps Engineer</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to="/interview-questions/product-manager"
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>Product Manager</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to="/interview-questions/cloud-architect"
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>Cloud Architect</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InterviewQuestionsPage;
