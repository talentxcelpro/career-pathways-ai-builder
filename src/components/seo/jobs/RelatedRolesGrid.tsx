// src/components/seo/jobs/RelatedRolesGrid.tsx
import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { JobRoleConfig, getRelatedRoles } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface RelatedRolesGridProps {
  currentRole: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
  isInternational: boolean;
}

export const RelatedRolesGrid: React.FC<RelatedRolesGridProps> = ({
  currentRole,
  experience,
  location,
  isInternational,
}) => {
  const related = getRelatedRoles(currentRole);

  if (related.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-blue-500" />
          Related Roles in {location.cityName} ({experience.label})
        </h3>
        <span className="text-xs text-muted-foreground">Adjacent Career Tracks</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {related.map((relRole) => {
          const url = isInternational
            ? `/jobs/${relRole.slug}/${experience.slug}/${location.countryCode.toLowerCase()}/${location.slug}`
            : `/jobs/${relRole.slug}/${experience.slug}/${location.slug}`;

          return (
            <a
              key={relRole.slug}
              href={url}
              className="p-3 rounded-xl border border-border/60 bg-card hover:border-blue-500/40 hover:bg-muted/30 transition-all flex items-center justify-between group"
            >
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground group-hover:text-blue-600 truncate">
                  {relRole.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {relRole.category}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        })}
      </div>
    </section>
  );
};
