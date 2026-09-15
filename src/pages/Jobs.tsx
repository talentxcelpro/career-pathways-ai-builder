import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Brain, Filter, TrendingUp, Building, MapPin, Zap, 
  Star, Heart, Clock, Users, Award, Sparkles, Target, 
  ChevronRight, Play, Mic, Shield, Rocket, Bell, Grid3X3,
  List, RotateCcw, Briefcase, Coins, LayoutGrid, Sparkle
} from 'lucide-react';
import { z } from 'zod';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useJobsCriticalPath } from '@/hooks/useJobsCriticalPath';
import { useRealtimeJobStats } from '@/hooks/useRealtimeJobs';
import { useStructuredData } from '@/hooks/useStructuredData';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTXCBalance } from '@/hooks/useTXCBalance';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// New Components for TalentSpark Experience
import { TalentSparkJobCard } from '@/components/jobs/TalentSparkJobCard';
import { SwipeableJobCard } from '@/components/jobs/SwipeableJobCard';
import { GlobalSearch } from '@/components/jobs/GlobalSearch';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { JobCard } from '@/components/jobs/JobCard';
import { SmartEmptyState } from '@/components/jobs/SmartEmptyState';
import { JobGamificationHeader } from '@/components/jobs/JobGamificationHeader';
import { useTalentScore } from '@/hooks/useTalentScore';

const filtersSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  company_name: z.string().optional(),
  employment_type: z.array(z.string()).optional(),
  experience_level: z.array(z.string()).optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  is_remote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    employment_type: searchParams.get('employment_type')?.split(',').filter(Boolean) || [],
    experience_level: searchParams.get('experience_level')?.split(',').filter(Boolean) || [],
    salary_min: parseInt(searchParams.get('salary_min') || '0'),
    salary_max: parseInt(searchParams.get('salary_max') || '0'),
    is_remote: searchParams.get('is_remote') === 'true',
    skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
    department: [],
    company_type: [],
    work_mode: [],
    industry: [],
    role_category: [],
    education: [],
    posted_by: [],
    freshness: [],
    company_id: searchParams.get('company') || '',
  }));

  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'swipe' | 'list'>(() => {
    return window.innerWidth < 768 ? 'swipe' : 'card';
  });
  const [swipeIndex, setSwipeIndex] = useState(0);

  const { txcBalance } = useTXCBalance();
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const { 
    jobs: allJobs, 
    totalCount,
    hasMore,
    isLoading, 
    isFetchingMore,
    loadMore,
    refetch
  } = useJobsCriticalPath(filters, sortBy);

  const { stats: jobStats } = useRealtimeJobStats();
  const { data: talentScoreData, isLoading: isScoreLoading } = useTalentScore();

  const mappedLevel = useMemo(() => {
    if (!talentScoreData) return 1;
    const score = talentScoreData.total;
    if (score >= 850) return 10;
    if (score >= 700) return 7;
    if (score >= 550) return 4;
    return 1;
  }, [talentScoreData]);

  const mappedExp = talentScoreData?.total || 0;
  const nextLevelThreshold = useMemo(() => {
    if (mappedLevel >= 10) return 1000;
    if (mappedLevel >= 7) return 850;
    if (mappedLevel >= 4) return 700;
    return 550;
  }, [mappedLevel]);

  const updateFilters = (newFilters: any) => {
    try {
      const validatedFilters = filtersSchema.parse(newFilters);
      setFilters(prev => ({ ...prev, ...validatedFilters }));
    } catch (error) {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
  };

  const { featuredJobs, regularJobs, sortedJobs } = useMemo(() => {
    if (!allJobs) return { featuredJobs: [], regularJobs: [], sortedJobs: [] };
    const sorted = [...allJobs].sort((a, b) => {
      switch (sortBy) {
        case 'salary_max': return (b.salary_max || 0) - (a.salary_max || 0);
        case 'views_count': return (b.views_count || 0) - (a.views_count || 0);
        default: return new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime();
      }
    });
    return {
      featuredJobs: sorted.filter(job => job.is_featured),
      regularJobs: sorted.filter(job => !job.is_featured),
      sortedJobs: sorted
    };
  }, [allJobs, sortBy]);

  const handleSaveJob = async (jobId: string) => {
    if (!currentUser) return toast.error('Please login to save jobs');
    try {
      if (savedJobs.includes(jobId)) {
        await supabase.from('saved_jobs').delete().eq('user_id', currentUser.id).eq('job_id', jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed');
      } else {
        await supabase.from('saved_jobs').insert({ user_id: currentUser.id, job_id: jobId });
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved! +5 Talent XP');
      }
    } catch (error) { toast.error('Failed to update'); }
  };

  const handleQuickApply = async (jobId: string) => {
    if (!currentUser) return toast.error('Please login to apply');
    toast.success('Application Sent! +10 Talent XP');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge">
      <Helmet>
        <title>TalentXcel | Opportunities | {totalCount.toLocaleString()} Roles</title>
      </Helmet>

      {/* Premium Header */}
      <div className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-600 text-white border-0 rounded-lg px-3 py-1 font-apple-bold text-[10px] tracking-widest uppercase">Live Opportunities</Badge>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">{totalCount.toLocaleString()} Active Roles</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-apple-heavy text-slate-950 tracking-tighter">
                Opportunity <span className="text-blue-600">Discovery</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl font-apple-medium mt-4">
                High-velocity professional matching. Access elite opportunities 
                verified via the TalentXcel performance network.
              </p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-slate-200/50 shadow-sm">
              <Button
                variant={viewMode === 'swipe' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('swipe')}
                className={cn("rounded-2xl px-6 font-apple-bold", viewMode === 'swipe' ? "bg-slate-950 shadow-lg" : "text-slate-500")}
              >
                <Sparkle className="w-4 h-4 mr-2" /> Talent Match
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className={cn("rounded-2xl px-6 font-apple-bold", viewMode === 'card' ? "bg-slate-950 shadow-lg" : "text-slate-500")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> View Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn("rounded-2xl px-6 font-apple-bold", viewMode === 'list' ? "bg-slate-950 shadow-lg" : "text-slate-500")}
              >
                <List className="w-4 h-4 mr-2" /> View Index
              </Button>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto">
            <GlobalSearch
              value={filters.search}
              onChange={(value) => updateFilters({ search: value })}
              onSearch={() => refetch()}
              onFiltersChange={(newFilters) => { updateFilters(newFilters); refetch(); }}
              placeholder="Search by role, company, or professional profile..."
              recentJobs={regularJobs.slice(0, 5)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-80 space-y-8 hidden lg:block">
              <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/20 p-8 shadow-xl shadow-slate-200/50 sticky top-24">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-apple-heavy text-slate-900">Advanced Filters</h2>
                </div>
                <ComprehensiveJobFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={() => {
                    setFilters({
                      search: '', location: '', employment_type: [], experience_level: [],
                      salary_min: 0, salary_max: 0, is_remote: false, skills: [],
                      department: [], company_type: [], work_mode: [], industry: [],
                      role_category: [], education: [], posted_by: [], freshness: [], company_id: ''
                    });
                    refetch();
                  }}
                />
              </div>
            </aside>

            {/* Main Listing Area */}
            <main className="flex-1 space-y-12">
              {!isScoreLoading && currentUser && (
                <JobGamificationHeader
                  userLevel={mappedLevel}
                  experience={mappedExp}
                  nextLevelExp={nextLevelThreshold}
                  txcBalance={txcBalance || 0}
                  dailyStreak={12}
                  weeklyTarget={15}
                  applicationsThisWeek={talentScoreData?.breakdown.activity.score ? Math.floor(talentScoreData.breakdown.activity.score / 5) : 0}
                  dailyChallenges={[]}
                />
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-[32px] bg-slate-200 animate-pulse" />)}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {viewMode === 'swipe' ? (
                    <motion.div key="swipe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
                      <SwipeableJobCard
                        jobs={sortedJobs}
                        currentIndex={swipeIndex}
                        onSave={handleSaveJob}
                        onQuickApply={handleQuickApply}
                        onReject={() => setSwipeIndex(prev => prev + 1)}
                        onApplication={() => setSwipeIndex(prev => prev + 1)}
                        isLoggedIn={!!currentUser}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {featuredJobs.map(job => (
                        <TalentSparkJobCard
                          key={job.id}
                          job={job}
                          onSave={handleSaveJob}
                          onQuickApply={handleQuickApply}
                          isSaved={savedJobs.includes(job.id)}
                          txcReward={15}
                          viewMode={viewMode}
                        />
                      ))}
                      {regularJobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job as any}
                          variant={viewMode === 'list' ? 'compact' : 'default'}
                          onSave={handleSaveJob}
                          onApply={handleQuickApply}
                          isSaved={savedJobs.includes(job.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button onClick={loadMore} className="rounded-2xl bg-slate-900 px-12 py-6 font-apple-bold hover:scale-105 transition-all">
                    Load More Opportunities
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Floating Navigator Trigger */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => navigate('/navigator')}
          className="w-16 h-16 rounded-[24px] bg-slate-900 text-white shadow-2xl hover:scale-110 transition-all group"
        >
          <Sparkles className="h-7 w-7 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
