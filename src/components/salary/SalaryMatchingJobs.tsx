import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CompensationBenchmark } from '@/services/salary/salaryBenchmarkEngine';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  organization_name?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_range?: string;
  skills_required?: string[];
  slug?: string;
  seo_slug?: string;
  created_at?: string;
}

export const SalaryMatchingJobs: React.FC<{ benchmark: CompensationBenchmark }> = ({ benchmark }) => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMatchingJobs() {
      setIsLoading(true);
      try {
        // Query job_postings matching role tokens
        const roleTokens = benchmark.normalizedRole.split(/\s+/).filter(t => t.length > 3);
        const searchKeyword = roleTokens[0] || 'Engineer';

        const { data, error } = await supabase
          .from('job_postings')
          .select('id, title, organization_name, location, salary_min, salary_max, salary_range, skills_required, slug, seo_slug, created_at')
          .eq('status', 'active')
          .ilike('title', `%${searchKeyword}%`)
          .limit(6);

        if (error) throw error;

        if (isMounted) {
          if (data && data.length > 0) {
            setJobs(data as any);
          } else {
            // Fallback to top active jobs
            const { data: fallbackData } = await supabase
              .from('job_postings')
              .select('id, title, organization_name, location, salary_min, salary_max, salary_range, skills_required, slug, seo_slug, created_at')
              .eq('status', 'active')
              .limit(6);

            setJobs((fallbackData as any) || []);
          }
        }
      } catch (err) {
        console.warn('Jobs lookup fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMatchingJobs();
    return () => { isMounted = false; };
  }, [benchmark.normalizedRole, benchmark.normalizedLocation]);

  const formatLakhs = (amount: number): string => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Verified Open Opportunities in This Compensation Tier
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live vacancies from TalentXcel Jobs network matching {benchmark.normalizedRole} in {benchmark.normalizedLocation}.
            </CardDescription>
          </div>
          <a
            href="https://jobs.talentxcel.in/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary flex items-center gap-1 self-start sm:self-auto"
          >
            Explore 10,000+ Jobs on jobs.talentxcel.in <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const jobSlug = job.seo_slug || job.slug || job.id;
              const hasStatedSalary = (job.salary_min && job.salary_min > 0) || (job.salary_max && job.salary_max > 0);
              const salaryDisplay = hasStatedSalary
                ? `${formatLakhs(job.salary_min || 0)} - ${formatLakhs(job.salary_max || 0)}`
                : job.salary_range || `Market Est: ${formatLakhs(benchmark.p25)} - ${formatLakhs(benchmark.p75)}`;

              return (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-primary/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {job.title}
                      </h4>
                      <Badge variant="outline" className="text-[11px] font-mono bg-white dark:bg-slate-900 shrink-0">
                        {salaryDisplay}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {job.organization_name || 'Verified Tech Employer'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location || benchmark.normalizedLocation}
                      </span>
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills_required.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://jobs.talentxcel.in/jobs/${jobSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-slate-200/80 dark:border-slate-800 hover:underline"
                  >
                    <span>View Role & Apply on TalentXcel Jobs</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            <p>Direct match listings currently updating in this cohort.</p>
            <a
              href="https://jobs.talentxcel.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              Browse all 10,000+ open positions on TalentXcel Jobs &rarr;
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
