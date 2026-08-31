
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, User, ArrowRight } from 'lucide-react';
import ComprehensiveJobApplicationForm from './ComprehensiveJobApplicationForm';

interface PublicJobApplyButtonProps {
  jobId: string;
  job: any;
  className?: string;
}

export const PublicJobApplyButton: React.FC<PublicJobApplyButtonProps> = ({ 
  jobId, 
  job, 
  className = "" 
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleApplyClick = () => {
    // Check if this is an external job first
    if (job?.external_url) {
      console.log('🔗 External job detected, redirecting to:', job.external_url);
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!currentUser) {
      // Store the return URL and redirect to login
      const targetSlug = job?.seo_slug || jobId;
      const returnUrl = `/jobs/${targetSlug}`;
      navigate(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    
    // User is authenticated and it's an internal job, show application form
    setShowApplicationForm(true);
  };

  if (loading) {
    return (
      <Button disabled className={className}>
        <Briefcase className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={handleApplyClick}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${className}`}
      >
        {currentUser ? (
          <>
            <Briefcase className="h-4 w-4 mr-2" />
            {job?.external_url ? 'Apply on Company Site' : 'Apply Now'}
          </>
        ) : (
          <>
            <User className="h-4 w-4 mr-2" />
            {job?.external_url ? 'Login to Apply' : 'Login to Apply'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {showApplicationForm && currentUser && (
        <ComprehensiveJobApplicationForm
          open={showApplicationForm}
          onOpenChange={setShowApplicationForm}
          job={job}
        />
      )}
    </>
  );
};
