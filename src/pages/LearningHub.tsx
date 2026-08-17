import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { AggregatedCourse, LearningProvider, CareerPathway, PersonalizedLearningPlan } from '@/types/learningAggregator';
import { DOMAIN_TARGETS } from '@/data/learningTaxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  FileSpreadsheet
} from 'lucide-react';

export default function LearningHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      
      {/* ============================================================================ */}
      {/* 1. INTENT-DRIVEN HERO HEADER */}
      {/* ============================================================================ */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-8 border-b border-slate-800 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/80 rounded-full px-4 py-1.5 text-xs font-extrabold text-blue-300 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>2,650+ Verified Free Learning Opportunities Indexed Across 18 Domains</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Learn Anything. Build Your Career.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Discover 2,000+ free and free-to-learn courses from trusted universities, technology companies and learning platforms. TalentXcel connects what you learn directly to verified jobs.
          </p>

          {/* Enormous AI Natural Language Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-6 w-6 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="What do you want to learn or become?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-36 h-16 text-base sm:text-lg rounded-2xl bg-slate-950 border-2 border-slate-700 focus-visible:border-blue-500 text-white placeholder:text-slate-400 shadow-2xl"
              />
              <Button 
                type="submit"
                className="absolute right-2 h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-md gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-blue-200" />
                <span>Search Intent</span>
              </Button>
            </div>
          </form>

          {/* Quick Intent Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-semibold">Try prompt:</span>
            
            <button 
              onClick={() => triggerAiPlanner("I have 5 years of HR experience and want to move into HR analytics. I have 6 hours per week.")}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              5 yrs HR experience ➔ HR Analytics (6 hrs/wk)
            </button>

            <button 
              onClick={() => navigate('/learning/careers/data-analyst')}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5 text-emerald-400" />
              Become a Data Analyst
            </button>

            <button 
              onClick={() => navigate('/learning/careers/ai-engineer')}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              Become an AI Engineer
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================================ */}
      {/* 2. INTENT-BASED FRONT DOOR ("WHAT DO YOU WANT TO ACHIEVE?") */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 space-y-16">
        
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="border-blue-500 text-blue-600 font-extrabold text-xs px-3 py-1">
              Intent-Driven Navigation
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              What do you want to achieve?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl mx-auto">
              Start with your goal. TalentXcel works backwards from career intent to find the optimal learning pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* COLUMN 1: START A CAREER */}
            <Card className="rounded-3xl border-slate-200 dark:border-border p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">🚀 Start a Career</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">Ordered step progressions</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { name: 'Data Analyst', slug: 'data-analyst', salary: '₹8 - ₹18 LPA' },
                  { name: 'AI Engineer', slug: 'ai-engineer', salary: '₹14 - ₹30 LPA' },
                  { name: 'Software Developer', slug: 'software-developer', salary: '₹10 - ₹24 LPA' },
                  { name: 'Cybersecurity Analyst', slug: 'cybersecurity', salary: '₹9 - ₹20 LPA' },
                  { name: 'Digital Marketer', slug: 'digital-marketing', salary: '₹7 - ₹15 LPA' },
                  { name: 'Product Manager', slug: 'product-manager', salary: '₹15 - ₹35 LPA' }
                ].map((role, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/learning/careers/${role.slug}`)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-100 dark:border-border/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <span className="font-extrabold text-foreground group-hover:text-blue-600">{role.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600">{role.salary}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* COLUMN 2: LEARN A SKILL */}
            <Card className="rounded-3xl border-slate-200 dark:border-border p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">⚡ Learn a Skill</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">Targeted competency modules</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { name: 'Python', icon: Code, count: '380 courses' },
                  { name: 'SQL', icon: BarChart3, count: '215 courses' },
                  { name: 'Excel', icon: FileSpreadsheet, count: '180 courses' },
                  { name: 'Generative AI', icon: Cpu, count: '165 courses' },
                  { name: 'Power BI', icon: BarChart3, count: '140 courses' },
                  { name: 'AWS Cloud', icon: Globe, count: '195 courses' }
                ].map((skill, i) => {
                  const Icon = skill.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(`/learning/courses?skill=${skill.name}`)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-100 dark:border-border/40 text-left transition-colors space-y-1 group"
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

            {/* COLUMN 3: EXPLORE BY INDUSTRY */}
            <Card className="rounded-3xl border-slate-200 dark:border-border p-6 space-y-4 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">🏢 Explore by Industry</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">Domain-specific taxonomies</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {DOMAIN_TARGETS.slice(0, 6).map((dt, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(dt.domain)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-100 dark:border-border/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <span className="font-extrabold text-foreground group-hover:text-purple-600">{dt.domain}</span>
                    <span className="text-[10px] font-bold text-slate-500">{dt.count} verified</span>
                  </button>
                ))}
              </div>
            </Card>

          </div>
        </section>

        {/* ============================================================================ */}
        {/* 3. POPULAR COURSES DISCOVERY GRID */}
        {/* ============================================================================ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-border pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span>Verified Free Learning Catalogue</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                Showing top verified courses from Microsoft, MIT, IBM, AWS, edX, and freeCodeCamp.
              </p>
            </div>

            <Badge variant="outline" className="border-slate-300 text-xs font-bold w-fit">
              Showing {courses.length} of 2,650 Verified Courses
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <Card 
                key={course.id}
                onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                className="rounded-3xl border-slate-200/80 dark:border-border/60 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl cursor-pointer overflow-hidden flex flex-col bg-white dark:bg-card group"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1 border border-white/10">
                    <ShieldCheck className="h-3 w-3 text-blue-400" />
                    <span>{course.provider_name}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                    {course.free_type.replace(/_/g, ' ')}
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                      {course.short_description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-slate-100 dark:border-border/40 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        {course.duration_text}
                      </span>

                      {course.talentxcel_match && (
                        <span className="font-extrabold text-emerald-600 flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" />
                          {course.talentxcel_match}% Match
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ============================================================================ */}
        {/* 4. PROVIDERS SHOWCASE SPOTLIGHT */}
        {/* ============================================================================ */}
        <section className="space-y-6 pt-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span>Verified Providers Showcase</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              Click any official provider to view their full catalog of free courses indexed by TalentXcel.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {providers.map(p => (
              <div 
                key={p.id}
                onClick={() => navigate(`/learning/providers/${p.slug}`)}
                className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border text-center space-y-2 hover:border-blue-500 transition-colors shadow-2xs cursor-pointer group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-muted flex items-center justify-center p-2 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                  <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground group-hover:text-blue-600 transition-colors truncate">{p.name}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">{p.course_count || '140'} Verified Courses</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ============================================================================ */}
      {/* 5. AI CAREER INTENT PLANNER DIALOG */}
      {/* ============================================================================ */}
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
              
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-1">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">Your Intent</div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">"{generatedPlan.user_intent}"</p>
              </div>

              {/* Strengths vs Skills to Build */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Current Strengths
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.current_strengths.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-card border border-emerald-300 text-emerald-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
                  <div className="text-xs font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                    <Target className="h-4 w-4" /> Skills to Build
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.skills_to_build.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-card border border-blue-300 text-blue-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-foreground uppercase tracking-wider">Your {generatedPlan.total_weeks}-Week Learning Schedule ({generatedPlan.weekly_hours} hrs/week)</div>
                <div className="space-y-2">
                  {generatedPlan.weekly_schedule.map((sched, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-xs flex items-center justify-between">
                      <span className="font-extrabold text-blue-600">{sched.week_range}</span>
                      <span className="font-semibold text-foreground">{sched.focus_skill}</span>
                      <Badge variant="outline" className="text-[10px] font-bold">{sched.courses_count} courses</Badge>
                    </div>
                  ))}
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