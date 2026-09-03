// src/components/seo/jobs/JobResultsList.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, ExternalLink, Calendar, ShieldCheck, IndianRupee } from 'lucide-react';
import { MatrixJobCardData } from '@/hooks/useMatrixJobs';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobLocationConfig } from '@/config/jobs/locations';

interface JobResultsListProps {
  jobs: MatrixJobCardData[];
  role: JobRoleConfig;
  location: JobLocationConfig;
}

export const JobResultsList: React.FC<JobResultsListProps> = ({ jobs, role, location }) => {
  if (jobs.length === 0) {
    return (
      <Card className="border border-dashed border-border/80 bg-muted/20 p-8 text-center rounded-2xl">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No live openings currently listed in {location.cityName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Employers frequently publish unannounced roles in {location.cityName}. Activate a 1-click WhatsApp or Email job alert below to receive direct notifications when hiring opens.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span>Active {role.title} Openings in {location.cityName}</span>
          <Badge variant="secondary" className="text-xs">
            {jobs.length} Verified
          </Badge>
        </h2>
        <span className="text-xs text-muted-foreground">Direct applications enabled</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border border-border/60 hover:border-blue-500/40 hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                    {job.company}
                  </span>
                  {job.isRemote && (
                    <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-500/30">
                      Remote Eligible
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                  <a href={job.url}>{job.title}</a>
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.experience}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <Button asChild size="sm" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white gap-1.5 text-xs font-semibold">
                  <a href={job.url}>
                    View &amp; Apply
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
