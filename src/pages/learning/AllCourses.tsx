import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProviderLogoBadge } from '@/components/learning/ProviderLogoBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Zap,
  Globe
} from 'lucide-react';

interface DBAggregatedCourse {
  id: string;
  title: string;
  slug: string;
  provider_id: string;
  provider_name: string;
  provider_logo?: string;
  source_url: string;
  canonical_url: string;
  short_description: string;
  category: string;
  domain: string;
  level: string;
  duration_text: string;
  free_type: string;
  certificate_type: string;
  skills: string[];
  career_relevance: string[];
  verification_status: string;
}

export const AllCourses: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [certFilter, setCertFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Fetch all verified courses directly from Supabase DB
  const { data: courses = [], isLoading } = useQuery<DBAggregatedCourse[]>({
    queryKey: ['all-verified-courses-explorer'],
    queryFn: async () => {
      let allRows: DBAggregatedCourse[] = [];
      let page = 0;
      const size = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('aggregated_courses' as any)
          .select('*')
          .eq('verification_status', 'VERIFIED')
          .order('title', { ascending: true })
          .range(page * size, (page + 1) * size - 1);

        if (error || !data || data.length === 0) break;
        allRows = allRows.concat(data as DBAggregatedCourse[]);
        if (data.length < size) break;
        page++;
      }
      return allRows;
    }
  });

  // Calculate Unique Filter Options
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => { if (c.category) set.add(c.category); });
    return Array.from(set).sort();
  }, [courses]);

  const providersList = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => { if (c.provider_name) set.add(c.provider_name); });
    return Array.from(set).sort();
  }, [courses]);

  // Filtered & Paginated Course Results
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        c.title.toLowerCase().includes(term) ||
        c.provider_name.toLowerCase().includes(term) ||
        c.short_description.toLowerCase().includes(term) ||
        (Array.isArray(c.skills) && c.skills.some(s => s.toLowerCase().includes(term)));

      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
      const matchesCert = certFilter === 'ALL' || c.certificate_type === certFilter;
      const matchesProv = providerFilter === 'ALL' || c.provider_name === providerFilter;

      return matchesSearch && matchesCat && matchesLevel && matchesCert && matchesProv;
    });
  }, [courses, searchTerm, categoryFilter, levelFilter, certFilter, providerFilter]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-border px-6 py-10 sm:px-12 text-center max-w-7xl mx-auto rounded-b-3xl shadow-2xs">
        <Badge variant="outline" className="mb-3 text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1">
          GLOBAL VERIFIED CATALOGUE
        </Badge>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Explore Verified Courses & Career Pathways
        </h1>
        
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Discover verified learning opportunities from top global technology leaders, universities, and open education platforms.
        </p>

        {/* Dynamic DB Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          
          <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-center shadow-2xs">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{courses.length}</div>
            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Verified Courses</div>
            <div className="text-[10px] text-slate-500 font-medium">Indexed in database</div>
          </Card>

          <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-center shadow-2xs">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{providersList.length}</div>
            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Global Providers</div>
            <div className="text-[10px] text-slate-500 font-medium">Official partner platforms</div>
          </Card>

          <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-center shadow-2xs">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {courses.filter(c => c.certificate_type === 'FREE_CERTIFICATE').length}
            </div>
            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Free Certificates</div>
            <div className="text-[10px] text-slate-500 font-medium">100% tuition free</div>
          </Card>

          <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-center shadow-2xs">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">100%</div>
            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">DB Grounded</div>
            <div className="text-[10px] text-slate-500 font-medium">Zero synthetic counters</div>
          </Card>

        </div>

      </div>

      {/* Main Explorer Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 space-y-6">

        {/* 2. SEARCH & MULTI-FILTER BAR */}
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-slate-200 dark:border-border shadow-xs space-y-4">
          
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by title, skill (Python, React, AWS, SQL...), or provider..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-11 h-12 rounded-2xl bg-slate-50 dark:bg-muted text-xs font-semibold border-slate-200 dark:border-border focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border text-xs font-extrabold cursor-pointer"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => handleFilterChange(setProviderFilter, e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border text-xs font-extrabold cursor-pointer"
            >
              <option value="ALL">All Providers ({providersList.length})</option>
              {providersList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => handleFilterChange(setLevelFilter, e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border text-xs font-extrabold cursor-pointer"
            >
              <option value="ALL">All Difficulty Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Certificate Filter */}
            <select
              value={certFilter}
              onChange={(e) => handleFilterChange(setCertFilter, e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border text-xs font-extrabold cursor-pointer"
            >
              <option value="ALL">All Certificate Types</option>
              <option value="FREE_CERTIFICATE">Free Certificate</option>
              <option value="PAID_CERTIFICATE">Paid Certificate</option>
              <option value="NO_CERTIFICATE">No Certificate (Audit)</option>
            </select>

          </div>

          {/* Active Filter Chips & Pagination Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border/40">
            <div className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Showing <span className="text-blue-600 font-black">{filteredCourses.length}</span> Verified Opportunities (Page {currentPage} of {totalPages})
            </div>

            {(searchTerm || categoryFilter !== 'ALL' || levelFilter !== 'ALL' || certFilter !== 'ALL' || providerFilter !== 'ALL') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('ALL');
                  setLevelFilter('ALL');
                  setCertFilter('ALL');
                  setProviderFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Reset All Filters
              </Button>
            )}
          </div>

        </div>

        {/* 3. COURSES CARDS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border animate-pulse p-6"></div>
            ))}
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border p-8">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold">No Verified Courses Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or dropdown filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((c) => (
              <Card 
                key={c.id} 
                className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <CardContent className="p-6 space-y-4">
                  
                  {/* Header: Provider Logo & Level Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ProviderLogoBadge name={c.provider_name} logoUrl={c.provider_logo} />
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                          {c.provider_name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {c.category}
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border-slate-300 dark:border-border text-slate-700 dark:text-slate-300">
                      {c.level}
                    </Badge>
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 line-clamp-2">
                      {c.short_description}
                    </p>
                  </div>

                  {/* Skills Tags */}
                  {Array.isArray(c.skills) && c.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.skills.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Bar: Duration & Free Badge */}
                  <div className="pt-2 border-t border-slate-100 dark:border-border/40 flex items-center justify-between text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>{c.duration_text || 'Self-Paced'}</span>
                    </div>

                    <Badge className={
                      c.certificate_type === 'FREE_CERTIFICATE' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold'
                    }>
                      {c.free_type}
                    </Badge>
                  </div>

                </CardContent>

                {/* Card CTA Footer */}
                <div className="bg-slate-50 dark:bg-muted/30 p-4 border-t border-slate-100 dark:border-border/40 flex items-center justify-between gap-2">
                  <Button 
                    asChild 
                    size="sm" 
                    className="rounded-xl text-xs font-extrabold w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-2xs"
                  >
                    <Link to={`/learning/courses/${c.slug || c.id}`}>
                      View Course Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                  <a 
                    href={c.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-border text-slate-600 hover:text-blue-600 hover:bg-white dark:hover:bg-card transition-colors shrink-0"
                    title="Direct Official Handoff"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

              </Card>
            ))}
          </div>
        )}

        {/* 4. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-border">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>

    </div>
  );
};

export default AllCourses;