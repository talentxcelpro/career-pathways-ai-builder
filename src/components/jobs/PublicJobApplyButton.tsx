import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Zap } from 'lucide-react';
import { GuestJobApplyModal } from './GuestJobApplyModal';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';

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
  const { user: currentUser } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState<boolean>(false);

  // Auto-open modal upon return from Google OAuth
  useEffect(() => {
    try {
      if (sessionStorage.getItem('txc_auto_open_apply') === jobId) {
        sessionStorage.removeItem('txc_auto_open_apply');
        setShowGuestModal(true);
      }
    } catch {}
  }, [jobId]);

  const handleApplyClick = () => {
    GrowthFunnelTracker.track('apply_cta_clicked', {
      job_id: jobId,
      job_title: job?.title || jobTitle,
      location: job?.location,
      external: !!job?.external_url,
      is_authenticated: !!currentUser,
    });

    // Always provide zero-friction 1-click modal for applicants
    setShowGuestModal(true);
  };

  return (
    <>
      <Button 
        data-testid="public-job-apply" 
        onClick={handleApplyClick}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${className}`}
      >
        <Zap className="h-4 w-4 mr-2 text-amber-300 fill-amber-300" />
        Apply Now
        <ArrowRight className="h-4 w-4 ml-2" />
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
