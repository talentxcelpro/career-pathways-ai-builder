// src/components/seo/jobs/RelatedCitiesGrid.tsx
import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig, getRelatedCities } from '@/config/jobs/locations';

interface RelatedCitiesGridProps {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  currentLocation: JobLocationConfig;
  isInternational: boolean;
}

export const RelatedCitiesGrid: React.FC<RelatedCitiesGridProps> = ({
  role,
  experience,
  currentLocation,
  isInternational,
}) => {
  const related = getRelatedCities(currentLocation, 8);

  if (related.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          {role.title} Jobs in Other Key Employment Hubs
        </h3>
        <span className="text-xs text-muted-foreground">Nearby &amp; Metro Centers</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {related.map((city) => {
          const isCityIntl = city.countryCode !== 'IN';
          const url = isCityIntl
            ? `/jobs/${role.slug}/${experience.slug}/${city.countryCode.toLowerCase()}/${city.slug}`
            : `/jobs/${role.slug}/${experience.slug}/${city.slug}`;

          return (
            <a
              key={city.slug}
              href={url}
              className="p-3 rounded-xl border border-border/60 bg-card hover:border-blue-500/40 hover:bg-muted/30 transition-all flex items-center justify-between group"
            >
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground group-hover:text-blue-600 truncate">
                  {city.cityName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {city.stateName || city.countryName}
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
