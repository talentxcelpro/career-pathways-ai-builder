// src/components/seo/jobs/MatrixBreadcrumbs.tsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface MatrixBreadcrumbsProps {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
  canonicalUrl: string;
}

export const MatrixBreadcrumbs: React.FC<MatrixBreadcrumbsProps> = ({
  role,
  experience,
  location,
  canonicalUrl,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <a href="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </a>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        </li>
        <li className="flex items-center gap-1.5">
          <a href="/jobs" className="hover:text-foreground">
            Jobs
          </a>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        </li>
        <li className="flex items-center gap-1.5">
          <a href={`/jobs/${role.slug}`} className="hover:text-foreground">
            {role.title}
          </a>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        </li>
        <li className="flex items-center gap-1.5">
          <span>{experience.label}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        </li>
        <li className="font-semibold text-foreground truncate max-w-[200px]">
          {location.cityName}
        </li>
      </ol>
    </nav>
  );
};
