// src/components/seo/jobs/ExperienceNavigation.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, GraduationCap, Briefcase, Award } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig, JOB_EXPERIENCES } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface ExperienceNavigationProps {
  role: JobRoleConfig;
  currentExperience: JobExperienceConfig;
  location: JobLocationConfig;
  isInternational: boolean;
}

export const ExperienceNavigation: React.FC<ExperienceNavigationProps> = ({
  role,
  currentExperience,
  location,
  isInternational,
}) => {
  const getExperienceIcon = (slug: string) => {
    switch (slug) {
      case 'freshers':
        return <GraduationCap className="h-4 w-4" />;
      case '1-3-years':
        return <Briefcase className="h-4 w-4" />;
      case '3-5-years':
        return <Award className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const buildUrl = (expSlug: string) => {
    return isInternational
      ? `/jobs/${role.slug}/${expSlug}/${location.countryCode.toLowerCase()}/${location.slug}`
      : `/jobs/${role.slug}/${expSlug}/${location.slug}`;
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Explore by Experience Level in {location.cityName}
        </h3>
        <span className="text-xs text-muted-foreground">Tailored role tracks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {JOB_EXPERIENCES.map((exp) => {
          const isCurrent = exp.slug === currentExperience.slug;
          const url = buildUrl(exp.slug);

          return (
            <a
              key={exp.slug}
              href={url}
              className={`block p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-500/5 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-border/60 bg-card hover:border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${isCurrent ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {getExperienceIcon(exp.slug)}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${isCurrent ? 'text-blue-600' : 'text-foreground'}`}>
                      {exp.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{exp.badgeLabel}</p>
                  </div>
                </div>
                {!isCurrent && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
