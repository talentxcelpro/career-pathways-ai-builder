
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, User, ArrowRight, Zap } from 'lucide-react';
import { GuestJobApplyModal } from './GuestJobApplyModal';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import ComprehensiveJobApplicationForm from './ComprehensiveJobApplicationForm';

interface PublicJobApplyButtonProps {
  jobId: string;
  job: any;
  className?: string;
  jobTitle?: string;
  companyName?: string;
}

export const PublicJobApplyButton: React.FC<PublicJobApplyButtonProps> = ({ 
  jobId, 
  job, 
  className = "",
  jobTitle,
  companyName,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
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
    GrowthFunnelTracker.track('apply_cta_clicked', {
      job_id: jobId,
      job_title: job?.title || jobTitle,
      location: job?.location,
      external: !!job?.external_url,
      is_authenticated: !!currentUser,
    });

    // Check if this is an external job first
    if (job?.external_url) {
      console.log('🔗 External job detected, redirecting to:', job.external_url);
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Always provide zero-friction 1-click modal for guest applicants
    setShowGuestModal(true);
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
            <Zap className="h-4 w-4 mr-2 text-amber-300 fill-amber-300" />
            {job?.external_url ? 'Apply on Company Site' : 'Apply Now'}
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2 text-amber-300 fill-amber-300" />
            {job?.external_url ? 'Apply on Company Site' : 'Apply Now'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {/* Zero-friction 1-Click Guest & Authenticated Application Modal */}
      <GuestJobApplyModal
        open={showGuestModal}
        onOpenChange={setShowGuestModal}
        job={job}
      />
    </>
  );
};
