// src/components/products/JobMatchProduct.tsx
// Independent Standalone Product for jobs.talentxcel.in (JobMatch OS)

import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink,
  Laptop,
  TrendingUp,
  Cpu,
  GraduationCap,
  HardHat,
  BadgeDollarSign,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { GuestJobApplyModal } from '@/components/jobs/GuestJobApplyModal';
import { toast } from 'sonner';

interface JobItem {
  id: string;
  title: string;
  company_name: string;
  location: string;
  location_city?: string;
  location_state?: string;
  employment_type?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  department?: string;
  industry?: string;
  external_url?: string;
  skills_required?: string[];
  application_deadline?: string;
  expires_at?: string;
  created_at: string;
}

const CORE_ORGANIZATIONS = [
  'bhel', 'isro', 'drdo', 'iocl', 'railway', 'rrb', 'ntpc', 'ongc', 'sail',
  'hal', 'bel', 'powergrid', 'coal india', 'lic', 'sbi', 'rbi', 'upsc', 'ssc'
];

const CORE_KEYWORDS = [
  'mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 
  'logistics', 'supply chain', 'manufacturing', 'public', 'government', 
  'audit', 'energy', 'psu', 'technician', 'plant', 'maintenance', 'site', 'trainee', 'sub-engineer'
];

const TECH_KEYWORDS = [
  'software', 'developer', 'frontend', 'backend', 'full stack', 'react', 
  'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'machine learning', 
  'qa', 'automation', 'cyber', 'security', 'it support', 'freshers', 'engineer', 
  'architect', 'sre', 'tech lead', 'programmer', 'analyst', 'database', 'platform'
];

const NON_TECH_KEYWORDS = [
  'marketing', 'sales', 'operations', 'customer', 'business', 'hr', 
  'human resources', 'finance', 'account', 'content', 'writer', 'support', 
  'management trainee', 'relationship manager', 'administration', 'hospitality',
  'telecaller', 'recruiter', 'lead generation', 'procurement', 'bpo', 'executive'
];

function categorizeJob(title: string, company?: string, department?: string, industry?: string): 'tech' | 'non-tech' | 'core' {
  const t = (title || '').toLowerCase();
  const c = (company || '').toLowerCase();
  const d = (department || '').toLowerCase();
  const ind = (industry || '').toLowerCase();
  const full = `${t} ${c} ${d} ${ind}`;

  if (CORE_ORGANIZATIONS.some(org => c.includes(org) || t.includes(org))) return 'core';
  if (CORE_KEYWORDS.some(k => full.includes(k))) return 'core';
  if (TECH_KEYWORDS.some(k => t.includes(k))) return 'tech';
  if (NON_TECH_KEYWORDS.some(k => full.includes(k))) return 'non-tech';
  if (d.includes('tech') || d.includes('it') || ind.includes('tech') || ind.includes('software')) return 'tech';
  return 'non-tech';
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min || min <= 0) return null;
  const minLakhs = (min / 100000).toFixed(1);
  if (!max || max === min) return `₹${minLakhs} LPA`;
  const maxLakhs = (max / 100000).toFixed(1);
  return `₹${minLakhs}L – ₹${maxLakhs}L CTC`;
}

export const JobMatchProduct: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeCategory, setActiveCategory] = useState<'tech' | 'non-tech' | 'core'>('tech');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(2236);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobItem | null>(null);

  useEffect(() => {
    conversionTelemetry.track('landing_view', { product: 'jobmatch_os', universe: 'JOBS' });
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // 1. Fetch exact live inventory count
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (count && count > 0) {
        setTotalCount(count);
      }

      // 2. Fetch active vacancies using exact schema columns (external_url instead of source_url)
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, salary_min, salary_max, department, industry, external_url, skills_required, application_deadline, expires_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      const now = new Date();
      // Drop expired vacancies
      const unexpired = (data || []).filter(j => {
        if (j.application_deadline && new Date(j.application_deadline) < now) return false;
        if (j.expires_at && new Date(j.expires_at) < now) return false;
        return true;
      });

      setJobs(unexpired);
    } catch (e) {
      console.warn('Job fetch exception:', e);
    } finally {
      setLoading(false);
    }
  };

  // Pre-calculate counts by category for tab indicators
  const categoryCounts = useMemo(() => {
    const counts = { tech: 0, 'non-tech': 0, core: 0 };
    jobs.forEach(j => {
      const cat = categorizeJob(j.title, j.company_name, j.department, j.industry);
      counts[cat]++;
    });
    return counts;
  }, [jobs]);

  // Filtered jobs based on Category, Location & Search Term
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Category check
      const jobCategory = categorizeJob(job.title, job.company_name, job.department, job.industry);
      if (jobCategory !== activeCategory) return false;

      // 2. City filter
      if (selectedCity !== 'all') {
        const loc = `${job.location_city || ''} ${job.location || ''}`.toLowerCase();
        if (selectedCity === 'remote') {
          if (!job.is_remote && !loc.includes('remote')) return false;
        } else if (!loc.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const skillsText = (job.skills_required || []).join(' ').toLowerCase();
        const searchableText = `${job.title} ${job.company_name} ${job.location} ${job.department || ''} ${job.industry || ''} ${skillsText}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, activeCategory, selectedCity, searchTerm]);

  const handleApplyClick = (job: JobItem) => {
    setSelectedJobForApply(job);
    conversionTelemetry.track('job_apply_clicked', { job_id: job.id, job_title: job.title });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>JobMatch OS by TalentXcel — Verified Tech, Non-Tech & Core Industry Jobs</title>
        <meta name="description" content="Discover verified tech, non-tech, and engineering jobs with 1-Click apply. Direct recruiter verified listings across Bangalore, Pune, Noida, and Remote." />
        <link rel="canonical" href="https://jobs.talentxcel.in/" />
      </Helmet>

      {/* Top Product Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-blue-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-blue-300">JobMatch OS</span>
            <span className="text-slate-400 hidden sm:inline">
              • {totalCount.toLocaleString()} Verified Active Vacancies • Fast 1-Click Apply
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="text-slate-300 hover:text-white text-xs font-medium">
              Browse All Jobs
            </Link>
            <Link to="/auth/register?intent=job_alerts" className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
              Get Daily Job Alerts →
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Hero Section */}
      <section className="px-4 pt-8 pb-6 max-w-5xl mx-auto text-center">
        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 mb-3">
          1-Click Direct Apply with Verified Career Passport
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
          Find Your Next <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Verified Job Match</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
          Zero ghost listings. Every role is verified with active application links and direct employer matches.
        </p>

        {/* Search Bar & City Selector */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-xl">
          <div className="flex-1 flex items-center gap-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <Input 
              type="text" 
              placeholder="Job title, skill (e.g. React, Marketing, Trainee)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-sm focus-visible:ring-0 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="w-full sm:w-48 flex items-center gap-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 border-0 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Locations</option>
              <option value="bangalore" className="bg-slate-900">Bengaluru / Bangalore</option>
              <option value="hyderabad" className="bg-slate-900">Hyderabad</option>
              <option value="pune" className="bg-slate-900">Pune</option>
              <option value="noida" className="bg-slate-900">Noida / Delhi-NCR</option>
              <option value="mumbai" className="bg-slate-900">Mumbai</option>
              <option value="moradabad" className="bg-slate-900">Moradabad / UP</option>
              <option value="remote" className="bg-slate-900">Remote / Work from Home</option>
            </select>
          </div>

          <Button 
            onClick={() => {}}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 rounded-xl"
          >
            Find Jobs
          </Button>
        </div>
      </section>

      {/* Tri-Industry Segment Tabs */}
      <section className="px-4 max-w-5xl mx-auto pb-12">
        <Tabs 
          value={activeCategory} 
          onValueChange={(val) => setActiveCategory(val as any)}
          className="w-full"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <TabsTrigger 
                value="tech" 
                className="text-xs font-bold px-4 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Tech & IT Jobs ({categoryCounts.tech})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="non-tech" 
                className="text-xs font-bold px-4 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Non-Tech & Business ({categoryCounts['non-tech']})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="core" 
                className="text-xs font-bold px-4 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Core Engineering & PSU ({categoryCounts.core})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Job Listings Stream */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Sparkles className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
                Loading verified vacancies...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
                <Briefcase className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <h4 className="text-base font-bold text-white mb-1">No vacancies found matching your filters</h4>
                <p className="text-xs text-slate-400 mb-4">Try clearing the search term or switching to "All Locations".</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="text-xs flex items-center gap-1 mx-auto">
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const salaryStr = formatSalary(job.salary_min, job.salary_max);
                return (
                  <div 
                    key={job.id} 
                    className="bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>
                        {job.is_remote && (
                          <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px]">
                            Remote
                          </Badge>
                        )}
                        {job.employment_type && (
                          <Badge variant="outline" className="text-slate-400 border-slate-800 text-[10px]">
                            {job.employment_type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-slate-200 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.company_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        {salaryStr && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <BadgeDollarSign className="w-3.5 h-3.5" />
                            {salaryStr}
                          </span>
                        )}
                      </div>

                      {/* Skill tags */}
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills_required.slice(0, 4).map((skill, sIdx) => (
                            <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {job.external_url && (
                        <a 
                          href={job.external_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs"
                          title="Original Source Notice"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyClick(job)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg px-4 flex-1 sm:flex-initial"
                      >
                        1-Click Apply
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Tabs>
      </section>

      {/* Guest Fast Apply Modal */}
      {selectedJobForApply && (
        <GuestJobApplyModal 
          open={!!selectedJobForApply}
          onOpenChange={(open) => {
            if (!open) setSelectedJobForApply(null);
          }}
          job={{
            id: selectedJobForApply.id,
            title: selectedJobForApply.title,
            company_name: selectedJobForApply.company_name,
            location: selectedJobForApply.location,
            external_url: selectedJobForApply.external_url
          }}
          onSuccess={() => {
            setSelectedJobForApply(null);
            toast.success('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};
