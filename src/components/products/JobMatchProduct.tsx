import React, { useState, useEffect } from 'react';
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
  BadgeDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import GuestJobApplyModal from '@/components/jobs/GuestJobApplyModal';

interface JobItem {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  department?: string;
  source_url?: string;
  skills_required?: string[];
  created_at: string;
}

export const JobMatchProduct: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeCategory, setActiveCategory] = useState<'tech' | 'non-tech' | 'core'>('tech');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobItem | null>(null);

  useEffect(() => {
    conversionTelemetry.track('landing_view', { product: 'jobmatch_os', universe: 'JOBS' });
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, employment_type, is_remote, salary_min, salary_max, department, source_url, skills_required, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setJobs(data || []);
    } catch (e) {
      console.warn('Error fetching jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  // Industry classification helpers
  const techKeywords = ['software', 'developer', 'frontend', 'backend', 'full stack', 'react', 'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'qa', 'cyber'];
  const nonTechKeywords = ['marketing', 'sales', 'operations', 'customer', 'business', 'hr', 'human resources', 'finance', 'account', 'content', 'writer', 'support', 'management trainee'];
  const coreKeywords = ['mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 'doctor', 'nurse', 'logistics', 'supply chain', 'manufacturing', 'public', 'government', 'audit', 'energy'];

  const filteredJobs = jobs.filter(job => {
    const text = (job.title + ' ' + (job.department || '') + ' ' + (job.company_name || '')).toLowerCase();
    
    // Category match
    let categoryMatch = false;
    if (activeCategory === 'tech') {
      categoryMatch = techKeywords.some(k => text.includes(k)) || (!nonTechKeywords.some(k => text.includes(k)) && !coreKeywords.some(k => text.includes(k)));
    } else if (activeCategory === 'non-tech') {
      categoryMatch = nonTechKeywords.some(k => text.includes(k));
    } else if (activeCategory === 'core') {
      categoryMatch = coreKeywords.some(k => text.includes(k));
    }

    // City match
    const cityMatch = selectedCity === 'all' || job.location?.toLowerCase().includes(selectedCity.toLowerCase());

    // Search term match
    const searchMatch = !searchTerm || text.includes(searchTerm.toLowerCase());

    return categoryMatch && cityMatch && searchMatch;
  });

  const handleApplyClick = (job: JobItem) => {
    setSelectedJobForApply(job);
    conversionTelemetry.track('job_apply_clicked', { job_id: job.id, job_title: job.title });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>JobMatch OS by TalentXcel — Verified Tech, Non-Tech & Core Industry Jobs</title>
        <meta name="description" content="Discover verified tech, non-tech, and engineering jobs with 1-Click apply. Direct recruiter verified listings across Bangalore, Pune, Noida, and Remote." />
        <link rel="canonical" href="https://jobs.talentxcel.in/" />
      </Helmet>

      {/* Top Product Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-blue-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-blue-300">JobMatch OS</span>
            <span className="text-slate-400 hidden sm:inline">• 2,200+ Verified Active Vacancies • Fast 1-Click Apply</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/jobs/saved" className="text-slate-300 hover:text-white text-xs font-medium">
              Saved Jobs
            </Link>
            <Link to="/jobs/alerts" className="text-slate-300 hover:text-white text-xs font-medium">
              Get Job Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Hero Section */}
      <section className="px-4 pt-8 pb-6 max-w-5xl mx-auto text-center">
        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 mb-3">
          1-Click Direct Apply with Verified Career Passport
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
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
              placeholder="Job title, skill (e.g. React, Operations, CAD)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-sm focus-visible:ring-0 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="w-full sm:w-44 flex items-center gap-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-200 border-0 focus:outline-hidden"
            >
              <option value="all" className="bg-slate-900">All Locations</option>
              <option value="bangalore" className="bg-slate-900">Bangalore</option>
              <option value="pune" className="bg-slate-900">Pune</option>
              <option value="noida" className="bg-slate-900">Noida / NCR</option>
              <option value="hyderabad" className="bg-slate-900">Hyderabad</option>
              <option value="mumbai" className="bg-slate-900">Mumbai</option>
              <option value="remote" className="bg-slate-900">Remote</option>
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
                <span>Tech & IT Jobs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="non-tech" 
                className="text-xs font-bold px-4 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Non-Tech & Business</span>
              </TabsTrigger>
              <TabsTrigger 
                value="core" 
                className="text-xs font-bold px-4 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Core Engineering & PSU</span>
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
                <Button size="sm" variant="outline" onClick={() => { setSearchTerm(''); setSelectedCity('all'); }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredJobs.slice(0, 20).map((job) => (
                <div 
                  key={job.id} 
                  className="bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      {job.is_remote && (
                        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Remote
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salary_min && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <BadgeDollarSign className="w-3.5 h-3.5" />
                          ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{((job.salary_max || job.salary_min * 1.5) / 100000).toFixed(1)}L CTC
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      onClick={() => handleApplyClick(job)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg px-4 w-full sm:w-auto"
                    >
                      1-Click Apply
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </section>

      {/* Guest Fast Apply Modal */}
      {selectedJobForApply && (
        <GuestJobApplyModal 
          jobId={selectedJobForApply.id}
          jobTitle={selectedJobForApply.title}
          companyName={selectedJobForApply.company_name}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => {
            setSelectedJobForApply(null);
            toast.success('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};
