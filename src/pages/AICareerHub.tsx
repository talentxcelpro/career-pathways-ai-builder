import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Calculator, MapPin, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

const AICareerHub = () => {
  const aiTools = [
    {
      id: 'co-pilot',
      title: 'AI Career Co-Pilot & Roadmap',
      description: 'Your personal AI assistant for career progression, skill gap diagnostics, and milestone planning.',
      icon: <Brain className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />,
      features: ['Personalized career roadmap', 'Target role progression', 'Skill gap analysis', 'Milestone action plan'],
      link: '/career-map/ai-roadmap-builder',
      badge: 'Popular'
    },
    {
      id: 'job-match',
      title: 'AI Job Match GPT',
      description: 'Intelligent job fit scoring and role alignment engine with salary benchmarks and ATS keyword insights.',
      icon: <Target className="h-7 w-7 text-blue-600 dark:text-blue-400" />,
      features: ['97% match accuracy', 'Skills compatibility', 'Salary benchmark analysis', 'Company culture fit'],
      link: '/tools/ai-job-match-gpt',
      badge: 'High Intent'
    },
    {
      id: 'pathfinder',
      title: 'Global Career & Education Pathway',
      description: 'Interactive 3-step AI wizard mapping your exact educational journey with verified ₹0 tuition & scholarships.',
      icon: <MapPin className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />,
      features: ['1,509 verified universities', 'Global scholarship match', 'Cost-to-earn projections', 'Step-by-step career path'],
      link: '/colleges/career-pathway',
      badge: 'Star Feature'
    },
    {
      id: 'skill-assessment',
      title: 'Skill Diagnostic & Assessment Engine',
      description: 'Timed technical assessment with weighted scoring, category breakdown, and personalized learning milestones.',
      icon: <Calculator className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      features: ['10-question technical diagnostic', 'Weighted category scoring', 'Instant answer review', 'Personalized learning curve'],
      link: '/tools/skill-assessment-engine',
      badge: 'Interactive'
    }
  ];

  return (
    <>
      <SEOHead
        title="AI Career Intelligence Hub | TalentXcel - Next-Gen Career & Learning Tools"
        description="Accelerate your career trajectory with TalentXcel's AI Career Intelligence Hub. Discover roadmaps, job matching, education pathways, and skill assessments."
        canonical="https://talentxcel.in/ai-career-hub"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              TalentXcel AI Career Intelligence Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Career Intelligence Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Leverage cutting-edge AI engines to accelerate your career trajectory with data-driven pathfinding, 
              intelligent job matching, and real-time skill assessments.
            </p>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiTools.map((tool) => (
              <Card key={tool.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                      {tool.icon}
                    </div>
                    {tool.badge && (
                      <Badge className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {tool.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to={tool.link} className="w-full">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl h-10 shadow-xs flex items-center justify-center gap-2 group transition-all">
                    Launch {tool.title}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Explore All 26 Tools Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-800/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-extrabold text-lg sm:text-xl tracking-tight">
                Looking for more specialized career tools?
              </div>
              <p className="text-xs sm:text-sm text-indigo-200">
                Explore all 26 purpose-built AI tools across Analytics, Resume, Interview, Job Search, and Networking.
              </p>
            </div>
            <Link to="/tools" className="shrink-0 w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm px-6 h-10 rounded-xl shadow-xs">
                View All 26 Tools
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 dark:text-white mb-6 tracking-tight">
              TalentXcel AI Career Performance Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">96.7%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Job Match Accuracy</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">450%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Career ROI</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">89%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Milestone Completion</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">1,509+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Institutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICareerHub;