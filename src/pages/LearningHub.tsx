import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { AggregatedCourse, LearningProvider, CareerPathway } from '@/types/learningAggregator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  Layers
} from 'lucide-react';

export default function LearningHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

    if (searchQuery.toLowerCase().includes('data analyst')) {
      navigate('/learning/careers/data-analyst');
    } else if (searchQuery.toLowerCase().includes('ai')) {
      navigate('/learning/careers/ai-engineer');
    } else {
      navigate(`/learning/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { label: 'All Courses', value: 'all', icon: Layers },
    { label: 'AI & Machine Learning', value: 'AI & Machine Learning', icon: Cpu },
    { label: 'Data Science & Analytics', value: 'Data Science & Analytics', icon: BarChart3 },
    { label: 'Programming & Web Dev', value: 'Programming & Web Dev', icon: Code },
    { label: 'Cloud & DevOps', value: 'Cloud & DevOps', icon: Globe },
    { label: 'Cybersecurity', value: 'Cybersecurity', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      
      {/* ============================================================================ */}
      {/* 1. COURSERA/UNACADEMY-STYLE HERO HEADER */}
      {/* ============================================================================ */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-8 border-b border-slate-800 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/80 rounded-full px-4 py-1.5 text-xs font-extrabold text-blue-300 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>TalentXcel Learning Aggregator • Provider-Agnostic Education</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Learn Anything. Build Your Career.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            We aggregate thousands of verified free learning opportunities from top global providers (<strong className="text-white">Microsoft, MIT, IBM, AWS, Google, edX</strong>) and connect what you learn directly to real jobs.
          </p>

          {/* AI Natural Language Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="What do you want to learn or become? (e.g. Data Analyst, AI Engineer, Python...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-14 text-sm sm:text-base rounded-2xl bg-slate-950 border-2 border-slate-700 focus-visible:border-blue-500 text-white placeholder:text-slate-400 shadow-2xl"
              />
              <Button 
                type="submit"
                className="absolute right-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md"
              >
                Explore Path
              </Button>
            </div>
          </form>

          {/* Example Prompt Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-semibold">Try searching:</span>
            
            <button 
              onClick={() => navigate('/learning/careers/data-analyst')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-emerald-400" />
              I want to become a Data Analyst
            </button>

            <button 
              onClick={() => navigate('/learning/careers/ai-engineer')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-purple-400" />
              I want to become an AI Engineer
            </button>

            <button 
              onClick={() => setSearchQuery('Free Python')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
            >
              Free Python Courses
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================================ */}
      {/* 2. MAIN CONTAINER */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
        
        {/* EXPLORE CAREER PATHS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span>Explore Career Paths</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                Structured step-by-step learning pathways connecting free courses to target job roles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pathways.map(path => (
              <Card 
                key={path.id} 
                className="rounded-3xl border-slate-200 dark:border-border hover:border-blue-500 transition-all shadow-sm hover:shadow-md p-6 space-y-4 bg-white dark:bg-card"
              >
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-xs px-3 py-1">
                    {path.target_role}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600">{path.average_salary}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-foreground">{path.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{path.description}</p>
                </div>

                {/* Step Preview Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {path.steps.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-border">
                      {idx + 1}. {s.skill_name}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-border/40">
                  <span className="text-xs text-muted-foreground font-medium">
                    {path.total_free_courses} Free Courses • {path.estimated_weeks} Weeks
                  </span>

                  <Button 
                    size="sm"
                    onClick={() => navigate(`/learning/careers/${path.slug}`)}
                    className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white gap-1"
                  >
                    View Learning Path <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CATEGORY FILTER TABS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-4 overflow-x-auto gap-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white dark:bg-card border border-slate-200 dark:border-border text-muted-foreground hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* POPULAR FREE COURSES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <Card 
                key={course.id}
                onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                className="rounded-3xl border-slate-200/80 dark:border-border/60 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl cursor-pointer overflow-hidden flex flex-col bg-white dark:bg-card group"
              >
                {/* Thumbnail */}
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

                {/* Card Content */}
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
                    {/* Skills Tags */}
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

        {/* PROVIDER SPOTLIGHT SECTION */}
        <section className="space-y-6 pt-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span>Courses from Trusted Global Providers</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              We index legitimate learning opportunities from universities, technology companies, and open educational foundations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {providers.map(p => (
              <div 
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border text-center space-y-2 hover:border-blue-500 transition-colors shadow-2xs"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center p-1.5 overflow-hidden">
                  <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground truncate">{p.name}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">{p.course_count || '50+'} Verified Courses</p>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}