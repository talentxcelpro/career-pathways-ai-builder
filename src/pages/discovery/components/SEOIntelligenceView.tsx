import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Sparkles, 
  TrendingUp, 
  Search, 
  FileText, 
  Wrench, 
  Compass, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Flame,
  Clock
} from 'lucide-react';

interface SEOIntelligenceViewProps {
  totalEntitiesCount: number;
}

export const SEOIntelligenceView: React.FC<SEOIntelligenceViewProps> = ({ totalEntitiesCount }) => {
  const core12Questions = [
    {
      qNum: 1,
      question: 'What are people trying to accomplish?',
      answer: 'High-intent practical goals: securing localized tech roles with verified compensation, enrolling in accredited degree programs under tuition caps, completing zero-fee statutory MSME/GST registration, and dispatching emergency trade services.',
      category: 'HUMAN_INTENT',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      qNum: 2,
      question: 'What intent is emerging?',
      answer: 'AI agent verification, AI systems evaluation frameworks, and low-cost verified local trade dispatch in Tier-2/Tier-3 hubs (Varanasi, UP industrial corridor).',
      category: 'EMERGING_INTENT',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
    {
      qNum: 3,
      question: 'What does Google/search demand show?',
      answer: `GSC sensor telemetry shows ${totalEntitiesCount.toLocaleString()} normalized queries, heavily clustering around "developer jobs in Varanasi", "AI master degrees", and "MSME registration UP".`,
      category: 'SEARCH_SENSOR',
      icon: <Search className="w-4 h-4 text-emerald-400" />,
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      qNum: 4,
      question: 'What real supply exists?',
      answer: '456 observed vacancies, 16 verified localized tech roles (Varanasi Rubric), 12 statutory government portals (Udyam, SPICe+, GST REG-01, StartInUP), and 4 verified trade guild rosters.',
      category: 'VERIFIED_REALITY',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    },
    {
      qNum: 5,
      question: 'What is missing (Supply Gap)?',
      answer: 'Verified data science internships with guaranteed stipends in UP, and direct university admission tracking for AKTU state colleges with accredited curriculum reviews.',
      category: 'SUPPLY_GAP',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
    {
      qNum: 6,
      question: 'Which intents deserve action?',
      answer: 'Intents with verified supply > 0 and demand > 1,000 monthly impressions: Frontend Varanasi jobs, AI Masters sub-5L, MCA SPICe+ statutory registration, and Varanasi trade guild dispatch.',
      category: 'ACTIONABLE_INTENT',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      qNum: 7,
      question: 'What should TalentXcel build?',
      answer: 'High-utility deterministic tools and direct statutory action gateways: Resume ATS Checker, Expense & SaaS Burn Arbitrage Tool, and Direct Government Registration Walkthroughs.',
      category: 'BUILD_PRIORITY',
      icon: <Wrench className="w-4 h-4 text-indigo-400" />,
      badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    },
    {
      qNum: 8,
      question: 'What should TalentXcel NOT build?',
      answer: 'No synthetic job listing pages where employer supply is zero. No doorway landing pages targeting city x keyword combinations without verified local providers. No generic career advice blogs.',
      category: 'ANTI_FABRICATION',
      icon: <Ban className="w-4 h-4 text-rose-400" />,
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    },
    {
      qNum: 9,
      question: 'Which pages should exist?',
      answer: 'Surfaces with 1-to-1 grounding in verified world state: /jobs?verified=true, /education/programs/ai-masters-degree, /tools/resume-checker, and /services/varanasi/plumbing.',
      category: 'INDEX_GOVERNOR',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      qNum: 10,
      question: 'Which pages should disappear (Retire/NoIndex)?',
      answer: 'Outdated job postings with expired employer requisitions, duplicate geographic filter permutations with zero inventory, and pages with >1,000 impressions but 0% resolution/conversion rate.',
      category: 'CONTENT_HYGIENE',
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      badgeColor: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
    },
    {
      qNum: 11,
      question: 'Which intent needs an action instead of content?',
      answer: '"ATS resume calibration for React developer" needs a 40-rule parser tool, not a 2,000-word article. "Reduce monthly expenses" needs an interactive burn audit calculator, not tips listicle.',
      category: 'ACTION_VS_CONTENT',
      icon: <BrainCircuit className="w-4 h-4 text-cyan-400" />,
      badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    },
    {
      qNum: 12,
      question: 'Which intent is likely to grow next (Foresight)?',
      answer: 'AI agent benchmarking & reliability verification, automated MSME compliance monitoring, and decentralized credential proofing. Lead time estimated: 45–60 days before mainstream search inflection.',
      category: 'FORESIGHT_INFLECTION',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs px-2.5 py-0.5 font-mono">
                Operating Layer: SEO INTELLIGENCE
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5 font-mono">
                12 Strategic Production Answers
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real-Time Discovery Operating System
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Answering the 12 core strategic questions governing what TalentXcel builds, monitors, retires, and executes across the human intent lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              Sensor: <span className="text-emerald-400 font-semibold">GSC Live</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              Reality Mode: <span className="text-cyan-400 font-semibold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12 Strategic Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {core12Questions.map((item) => (
          <Card key={item.qNum} className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all text-slate-100 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="outline" className={`text-2xs font-mono px-2 py-0.5 ${item.badgeColor} flex items-center gap-1`}>
                  {item.icon}
                  {item.category}
                </Badge>
                <span className="text-2xs font-mono text-slate-500 font-bold">Q{item.qNum}</span>
              </div>
              <CardTitle className="text-sm font-bold text-white leading-snug">
                {item.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
