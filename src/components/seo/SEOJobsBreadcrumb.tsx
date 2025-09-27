import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface SEOJobsBreadcrumbProps {
  role: string;
  city: string;
  industry?: string;
  skill?: string;
  experienceLevel?: string;
  salaryRange?: string;
  company?: string;
  isRemote?: boolean;
}

/**
 * SEO-Optimized Breadcrumb Navigation for Jobs Pages
 * Provides structured navigation and additional SEO signals
 */
export const SEOJobsBreadcrumb: React.FC<SEOJobsBreadcrumbProps> = ({
  role,
  city,
  industry,
  skill,
  experienceLevel,
  salaryRange,
  company,
  isRemote
}) => {
  const breadcrumbItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Jobs', href: '/jobs' },
  ];

  // Build breadcrumb based on available parameters
  if (isRemote) {
    breadcrumbItems.push({ label: 'Remote Jobs', href: '/jobs/remote' });
  }

  if (company) {
    breadcrumbItems.push({ label: 'Top Companies', href: '/jobs/top-companies' });
    breadcrumbItems.push({ label: company, href: `/jobs/top-companies/${company.toLowerCase().replace(/\s+/g, '-')}` });
  }

  if (role) {
    const roleUrl = company 
      ? `/jobs/top-companies/${company.toLowerCase().replace(/\s+/g, '-')}/${role.toLowerCase().replace(/\s+/g, '-')}`
      : isRemote 
        ? `/jobs/remote/${role.toLowerCase().replace(/\s+/g, '-')}`
        : `/jobs/${role.toLowerCase().replace(/\s+/g, '-')}`;
    
    breadcrumbItems.push({ label: role, href: roleUrl });
  }

  if (industry && role) {
    breadcrumbItems.push({ 
      label: industry, 
      href: `/jobs/${role.toLowerCase().replace(/\s+/g, '-')}/${industry.toLowerCase().replace(/\s+/g, '-')}` 
    });
  }

  if (skill && role && !industry) {
    breadcrumbItems.push({ 
      label: skill, 
      href: `/jobs/${role.toLowerCase().replace(/\s+/g, '-')}/${skill.toLowerCase().replace(/\s+/g, '-')}` 
    });
  }

  if (salaryRange && role) {
    breadcrumbItems.push({ 
      label: salaryRange, 
      href: `/jobs/${role.toLowerCase().replace(/\s+/g, '-')}/${salaryRange.toLowerCase().replace(/\s+/g, '-')}` 
    });
  }

  if (city) {
    const basePath = breadcrumbItems[breadcrumbItems.length - 1]?.href || '/jobs';
    breadcrumbItems.push({ 
      label: city, 
      href: `${basePath}/${city.toLowerCase().replace(/\s+/g, '-')}` 
    });
  }

  if (experienceLevel && skill && role && city) {
    breadcrumbItems.push({ 
      label: experienceLevel, 
      href: `/jobs/${role.toLowerCase().replace(/\s+/g, '-')}/${skill.toLowerCase().replace(/\s+/g, '-')}/${city.toLowerCase().replace(/\s+/g, '-')}/${experienceLevel.toLowerCase().replace(/\s+/g, '-')}` 
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
              )}
              
              {isLast ? (
                <span className="font-medium text-foreground flex items-center">
                  {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <a 
                  href={item.href}
                  className="hover:text-primary transition-colors flex items-center"
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>

      {/* Structured Data for Breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `https://talentxcel.in${item.href}`
          }))
        })}
      </script>
    </nav>
  );
};