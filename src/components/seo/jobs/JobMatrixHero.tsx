// src/components/seo/jobs/JobMatrixHero.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Sparkles, Building2 } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface JobMatrixHeroProps {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
  totalJobs: number;
}

export const JobMatrixHero: React.FC<JobMatrixHeroProps> = ({
  role,
  experience,
  location,
  totalJobs,
}) => {
  return (
    <header className="space-y-4 border-b border-border/70 pb-8 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs uppercase tracking-wide bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Briefcase className="h-3 w-3 mr-1 inline" />
          {role.category}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
          <MapPin className="h-3 w-3 mr-1 inline text-muted-foreground" />
          {location.cityName}{location.stateName ? `, ${location.stateName}` : ''} ({location.countryCode})
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs font-medium bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
          {experience.badgeLabel}
        </Badge>
      </div>

      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
        {role.title} Jobs for {experience.label} in {location.cityName}
      </h1>

      <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
        {role.description} Discover verified hiring opportunities, salary benchmarks, and direct company applications in {location.cityName}.
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Building2 className="h-4 w-4 text-blue-500" />
          {totalJobs > 0 ? `${totalJobs} Active Openings` : 'Continuous Employer Influx'}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Real-time Database Verified
        </span>
      </div>
    </header>
  );
};
