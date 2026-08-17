import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { AggregatedCourse, LearningProvider, CareerPathway, PersonalizedLearningPlan } from '@/types/learningAggregator';
import { DOMAIN_TARGETS } from '@/data/learningTaxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  GraduationCap,
  Code,
  BarChart3,
  Globe,
  Star,
  Users,
  Building2,
  TrendingUp,
  Cpu,
  Layers,
  Rocket,
  Zap,
  Target,
  FileSpreadsheet,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Check,
  Compass,
  Trophy,
  ArrowUpRight
} from 'lucide-react';

export default function LearningHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Explore');
  const [activeCategory, setActiveCategory] = useState('all');

  // AI Career Intent Planner Dialog State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<PersonalizedLearningPlan | null>(null);

  // Fetch verified aggregated courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['aggregated-courses-hub', activeCategory],
    queryFn: () => learningAggregatorService.getCourses({ category: activeCategory })
  });

  // Fetch verified providers
  const { data: providers = [] } = useQuery({
    queryKey: ['aggregated-providers-hub'],
    queryFn: () => learningAggregatorService.getProviders()
  });

  // Fetch career pathways
  const { data: pathways = [] } = useQuery({
    queryKey: ['aggregated-pathways-hub'],
    queryFn: () => learningAggregatorService.getCareerPathways()
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.toLowerCase().includes('hr')) {
      triggerAiPlanner("I have 5 years of HR experience and want to move into HR analytics. I have 6 hours per week.");
    } else if (searchQuery.toLowerCase().includes('data analyst')) {
      navigate('/learning/careers/data-analyst');
    } else if (searchQuery.toLowerCase().includes('ai')) {
      navigate('/learning/careers/ai-engineer');
    } else {
      navigate(`/learning/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const triggerAiPlanner = async (promptText: string) => {
    setAiPromptInput(promptText);
    setIsAiModalOpen(true);
    setIsGeneratingPlan(true);

    const plan = await learningAggregatorService.generatePersonalizedPlan(promptText);
    setTimeout(() => {
      setGeneratedPlan(plan);
      setIsGeneratingPlan(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      
      {/* ============================================================================ */}
      {/* 1. PREMIUM HEADER BANNER & SEARCH HERO */}
      {/* ============================================================================ */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-8 relative overflow-hidden shadow-xl border-b border-slate-800">
        
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          
          {/* Top Pill Counter Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs font-extrabold text-blue-200 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>TalentXcel Learning Aggregator • 2,650+ Verified Opportunities</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-blue-400" /> 18 Domains</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4 text-purple-400" /> 25+ Global Providers</span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Learn Anything. Build Your Career.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Discover verified free courses from <strong className="text-white">Microsoft, MIT, IBM, AWS, Google, edX</strong> and <strong className="text-white">freeCodeCamp</strong>. TalentXcel connects what you learn directly to real jobs.
            </p>
          </div>

          {/* Enormous Premium Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-4xl">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-700/80 focus-within:border-blue-500 transition-all p-1.5">
              <Search className="h-6 w-6 text-slate-400 ml-4 pointer-events-none shrink-0" />
              <input
                type="text"
                placeholder="What do you want to learn or become? (e.g. Data Analyst, AI Engineer, Python, 5 yrs HR experience...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-4 h-12 text-sm sm:text-base font-medium text-slate-900 dark:text-white bg-transparent placeholder:text-slate-400 focus:outline-none"
              />
              <Button 
                type="submit"
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md shrink-0 gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-blue-200" />
                <span>Search Intent</span>
              </Button>
            </div>
          </form>

          {/* Quick Intent Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-bold mr-1">Popular Prompts:</span>
            
            <button 
              onClick={() => triggerAiPlanner("I have 5 years of HR experience and want to move into HR analytics. I have 6 hours per week.")}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-200 border border-white/15 font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              5 yrs HR ➔ HR Analytics (6 hrs/wk)
            </button>

            <button 
              onClick={() => navigate('/learning/careers/data-analyst')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-200 border border-white/15 font-bold transition-all flex items-center gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5 text-emerald-300" />
              Data Analyst Pathway
            </button>

            <button 
              onClick={() => navigate('/learning/careers/ai-engineer')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-200 border border-white/15 font-bold transition-all flex items-center gap-1.5"
            >
              <Cpu className="h-3.5 w-3.5 text-blue-300" />
              AI Engineer Pathway
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================================ */}
      {/* 2. SUB-HEADER PILL NAVIGATION TABS */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
          {[
            { label: 'Explore Catalogue', icon: Compass },
            { label: 'Career Pathways', icon: Rocket },
            { label: 'Skill Search', icon: Zap },
            { label: 'Verified Providers', icon: Building2 },
            { label: 'Certificates', icon: Award },
            { label: 'AI Intent Planner', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  if (tab.label === 'AI Intent Planner') {
                    triggerAiPlanner("I want to learn Python for Data Science");
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 3. MAIN CONTENT LAYOUT (INTENT ENGINE & DISCOVERY GRID) */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / MAIN COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* INTENT CARDS ("WHAT DO YOU WANT TO ACHIEVE?") */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">What do you want to achieve?</h2>
                <p className="text-xs text-muted-foreground font-medium">Choose your primary goal to filter 2,650+ verified opportunities</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-blue-500 text-blue-600">
                Intent Engine
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CAREER PATHWAYS CARD */}
              <Card className="rounded-3xl border-slate-200 dark:border-border p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">🚀 Start a Career</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Structured step-by-step pathways</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'Data Analyst', slug: 'data-analyst', salary: '₹8 - ₹18 LPA' },
                    { name: 'AI Engineer', slug: 'ai-engineer', salary: '₹14 - ₹30 LPA' },
                    { name: 'Software Developer', slug: 'software-developer', salary: '₹10 - ₹24 LPA' }
                  ].map((role, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/learning/careers/${role.slug}`)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-blue-50 text-left transition-colors flex items-center justify-between text-xs group border border-slate-100"
                    >
                      <span className="font-extrabold text-foreground group-hover:text-blue-600">{role.name}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{role.salary}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* SKILLS CARDS */}
              <Card className="rounded-3xl border-slate-200 dark:border-border p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">⚡ Learn a Skill</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Targeted course competencies</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Python', icon: Code, count: '380 courses' },
                    { name: 'SQL', icon: BarChart3, count: '215 courses' },
                    { name: 'Excel', icon: FileSpreadsheet, count: '180 courses' },
                    { name: 'Power BI', icon: BarChart3, count: '140 courses' }
                  ].map((skill, i) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(`/learning/courses?skill=${skill.name}`)}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-emerald-50 text-left transition-colors space-y-0.5 border border-slate-100 group"
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-extrabold text-xs text-foreground group-hover:text-emerald-600">{skill.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">{skill.count}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

            </div>
          </section>

          {/* VERIFIED COURSES CATALOGUE FEED */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">Verified Free Courses</h2>
                <p className="text-xs text-muted-foreground font-medium">Direct handoff to official providers with verified free access</p>
              </div>

              <Badge variant="outline" className="text-xs font-bold border-slate-300">
                {courses.length} Verified
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => (
                <Card 
                  key={course.id}
                  className="rounded-3xl border-slate-200/90 dark:border-border hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden flex flex-col bg-white dark:bg-card group p-5 space-y-4"
                >
                  {/* Provider Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-muted p-1 flex items-center justify-center overflow-hidden border border-slate-200/80">
                        <img src={course.provider_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg'} alt={course.provider_name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-foreground flex items-center gap-1">
                          <span>{course.provider_name}</span>
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{course.source_domain}</span>
                      </div>
                    </div>

                    <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5">
                      {course.free_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Course Title & Short Description */}
                  <div className="space-y-1.5 flex-1">
                    <h3 
                      onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                      className="text-sm font-extrabold text-foreground group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 leading-snug"
                    >
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-medium leading-relaxed">
                      {course.short_description}
                    </p>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-muted font-bold text-slate-700 dark:text-slate-300">
                      {course.level}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-muted font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" /> {course.duration_text}
                    </span>
                  </div>

                  {/* Why Recommended Box */}
                  {course.recommendation_reason && (
                    <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                      <div className="font-extrabold flex items-center justify-between">
                        <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-600" /> Why Recommended:</span>
                        {course.talentxcel_match && <span className="text-emerald-700 font-extrabold">{course.talentxcel_match}% Match</span>}
                      </div>
                      <p className="line-clamp-2 font-medium">{course.recommendation_reason}</p>
                    </div>
                  )}

                  {/* CTA Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-border/40 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                      className="rounded-xl text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        learningAggregatorService.trackHandoff({
                          course_id: course.id,
                          provider_id: course.provider_id,
                          provider_name: course.provider_name,
                          source_url: course.source_url,
                          clicked_at: new Date().toISOString(),
                          source_page: 'catalogue_feed'
                        });
                        toast.success(`Redirecting to ${course.provider_name}...`);
                        window.open(course.source_url, '_blank', 'noopener,noreferrer');
                      }}
                      className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm"
                    >
                      <span>Start Course on {course.provider_name}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                </Card>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR COLUMN (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CAREER PASSPORT INTEGRATION CARD */}
          <Card className="rounded-3xl border-slate-200 dark:border-border bg-white dark:bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-foreground">TalentXcel Career Passport</h3>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Earn verified digital credentials from Microsoft, IBM, and MIT that automatically sync with your TalentXcel Passport.
            </p>
            <Button 
              onClick={() => navigate('/career-passport')}
              className="w-full rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              View My Career Passport
            </Button>
          </Card>

          {/* VERIFIED PROVIDERS SPOTLIGHT */}
          <Card className="rounded-3xl border-slate-200 dark:border-border bg-white dark:bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Trusted Providers</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">25+ Global</span>
            </div>

            <div className="space-y-2.5">
              {providers.slice(0, 5).map(p => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/learning/providers/${p.slug}`)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-blue-50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden border border-slate-200">
                      <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground group-hover:text-blue-600">{p.name}</h4>
                      <span className="text-[10px] text-muted-foreground font-medium">{p.course_count || '140'} Verified</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </Card>

          {/* MATCHING TALENTXCEL JOBS WIDGET */}
          <Card className="rounded-3xl border-slate-200 dark:border-border bg-white dark:bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-extrabold text-foreground">Jobs Requiring These Skills</h3>
            </div>
            <p className="text-xs text-muted-foreground font-medium">342 active jobs matching course competencies:</p>

            <div className="space-y-2">
              {[
                { title: 'Junior Data Analyst', company: 'Savantis Solutions', salary: '₹8 - ₹12 LPA' },
                { title: 'BI Specialist', company: 'Nexgenn Services', salary: '₹10 - ₹16 LPA' },
                { title: 'Analytics Associate', company: 'Global Tech Corp', salary: '₹9 - ₹14 LPA' }
              ].map((job, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground">{job.title}</h4>
                    <span className="text-[9px] font-bold text-emerald-600">{job.salary}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{job.company}</p>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/jobs')}
              className="w-full rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
            >
              Explore Verified Jobs
            </Button>
          </Card>

        </div>

      </div>

      {/* AI CAREER INTENT PLANNER DIALOG */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>TalentXcel AI Career Intent Plan</span>
            </DialogTitle>
          </DialogHeader>

          {isGeneratingPlan ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-muted-foreground">Synthesizing personalized 12-week learning plan from 2,650+ courses...</p>
            </div>
          ) : generatedPlan && (
            <div className="space-y-6 pt-2">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 space-y-1">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">Your Intent</div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">"{generatedPlan.user_intent}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2">
                  <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Current Strengths
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.current_strengths.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-2">
                  <div className="text-xs font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                    <Target className="h-4 w-4" /> Skills to Build
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.skills_to_build.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setIsAiModalOpen(false);
                  navigate('/learning/careers/data-analyst');
                }}
                className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md"
              >
                View Selected 23 Free Courses for This Pathway
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}