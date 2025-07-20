import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateBreadcrumbStructuredData } from '@/utils/structuredData';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbNavigationProps {
  customBreadcrumbs?: BreadcrumbItem[];
  showStructuredData?: boolean;
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  customBreadcrumbs,
  showStructuredData = true,
  className = ""
}) => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      setIsLoading(true);
      
      if (customBreadcrumbs) {
        setBreadcrumbs(customBreadcrumbs);
        setIsLoading(false);
        return;
      }

      try {
        // Get breadcrumb configuration from database
        const { data: configs } = await supabase
          .from('breadcrumb_configs')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (!configs) {
          setDefaultBreadcrumbs();
          return;
        }

        // Find matching pattern
        const matchingConfig = configs.find(config => 
          matchesPattern(location.pathname, config.page_pattern)
        );

        if (matchingConfig) {
          const structure = Array.isArray(matchingConfig.breadcrumb_structure) 
            ? (matchingConfig.breadcrumb_structure as unknown as BreadcrumbItem[])
            : [];
          setBreadcrumbs(processTemplate(structure, location.pathname));
        } else {
          setDefaultBreadcrumbs();
        }
      } catch (error) {
        console.error('Error loading breadcrumb config:', error);
        setDefaultBreadcrumbs();
      } finally {
        setIsLoading(false);
      }
    };

    generateBreadcrumbs();
  }, [location.pathname, customBreadcrumbs]);

  useEffect(() => {
    if (showStructuredData && breadcrumbs.length > 0) {
      const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
      
      // Remove existing breadcrumb structured data
      const existing = document.querySelector('script[data-breadcrumb-structured-data]');
      if (existing) {
        existing.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb-structured-data', 'true');
      script.textContent = structuredData;
      document.head.appendChild(script);

      return () => {
        const cleanup = document.querySelector('script[data-breadcrumb-structured-data]');
        if (cleanup) {
          cleanup.remove();
        }
      };
    }
  }, [breadcrumbs, showStructuredData]);

  const matchesPattern = (path: string, pattern: string): boolean => {
    const regex = pattern
      .replace(/:\w+/g, '[^/]+')
      .replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`).test(path);
  };

  const processTemplate = (structure: BreadcrumbItem[], path: string): BreadcrumbItem[] => {
    return structure.map((item, index) => {
      let processedItem = { ...item };
      
      // Process template variables
      if (item.name.includes('{{')) {
        const pathSegments = path.split('/').filter(Boolean);
        processedItem.name = item.name.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          const segmentIndex = pathSegments.findIndex(segment => 
            structure[index - 1]?.url?.includes(segment)
          );
          return pathSegments[segmentIndex + 1] || key;
        });
      }

      // Set current page URL for last item
      if (index === structure.length - 1 && !item.url) {
        processedItem.url = path;
      }

      return processedItem;
    });
  };

  const setDefaultBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const defaultBreadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: '/' }
    ];

    segments.forEach((segment, index) => {
      const url = '/' + segments.slice(0, index + 1).join('/');
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      defaultBreadcrumbs.push({ name, url });
    });

    setBreadcrumbs(defaultBreadcrumbs);
  };

  if (isLoading) {
    return (
      <nav className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
        <div className="animate-pulse flex space-x-2">
          <div className="h-4 w-16 bg-muted rounded"></div>
          <ChevronRight className="h-4 w-4" />
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
      </nav>
    );
  }

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.url || index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          
          {index === 0 && (
            <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          
          {index === breadcrumbs.length - 1 ? (
            <span 
              className="font-medium text-foreground"
              aria-current="page"
            >
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.url}
              className="hover:text-foreground transition-colors"
              aria-label={`Navigate to ${crumb.name}`}
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};