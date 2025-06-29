
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const useAnalyticsTracking = () => {
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  // Track page views with enhanced data
  useEffect(() => {
    const pageTitle = document.title;
    const pagePath = location.pathname;
    
    // Enhanced page view tracking
    trackEvent('page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });

    // Track specific page types
    if (pagePath.includes('/jobs/')) {
      trackEvent('job_page_view', {
        job_id: pagePath.split('/jobs/')[1],
        page_type: 'job_detail',
      });
    } else if (pagePath.includes('/companies/')) {
      trackEvent('company_page_view', {
        company_id: pagePath.split('/companies/')[1],
        page_type: 'company_profile',
      });
    } else if (pagePath.includes('/learning/')) {
      trackEvent('learning_page_view', {
        page_type: 'learning_content',
        learning_path: pagePath,
      });
    }
  }, [location, trackEvent]);

  return {
    trackJobSearch: (query: string, filters: Record<string, any> = {}) => {
      trackEvent('job_search', {
        search_term: query,
        filters: JSON.stringify(filters),
        event_category: 'search',
      });
    },
    
    trackJobView: (jobId: string, jobTitle: string, companyName: string) => {
      trackEvent('job_view', {
        job_id: jobId,
        job_title: jobTitle,
        company_name: companyName,
        event_category: 'engagement',
      });
    },
    
    trackProfileView: (profileType: 'user' | 'company', profileId: string) => {
      trackEvent('profile_view', {
        profile_type: profileType,
        profile_id: profileId,
        event_category: 'social',
      });
    },
    
    trackToolUsage: (toolName: string, action: string) => {
      trackEvent('tool_usage', {
        tool_name: toolName,
        action: action,
        event_category: 'tools',
      });
    },
    
    trackDownload: (fileName: string, fileType: string) => {
      trackEvent('file_download', {
        file_name: fileName,
        file_type: fileType,
        event_category: 'downloads',
      });
    },
  };
};
