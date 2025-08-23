import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useMobileOptimizedNavigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const navigateToProfile = (userId: string, username?: string) => {
    if (!userId) return;

    if (username) {
      // Navigate to username-based profile for better UX and SEO
      navigate(`/@${username}`);
    } else {
      // Fallback to ID-based profile
      navigate(`/profile/${userId}`);
    }
  };

  const navigateToJob = (jobId: string, slug?: string) => {
    if (!jobId) return;

    if (slug) {
      navigate(`/jobs/${slug}`);
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

  const navigateToCompany = (companyId: string, slug?: string) => {
    if (!companyId) return;

    if (slug) {
      navigate(`/companies/${slug}`);
    } else {
      navigate(`/companies/${companyId}`);
    }
  };

  const navigateBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isMobile ? '/network' : '/');
    }
  };

  return {
    navigateToProfile,
    navigateToJob,
    navigateToCompany,
    navigateBack,
    isMobile
  };
};