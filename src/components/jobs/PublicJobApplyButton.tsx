
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, User, ArrowRight } from 'lucide-react';
import SimpleJobApplicationDialog from './SimpleJobApplicationDialog';

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
    if (!currentUser) {
      // Store the return URL and redirect to login
      const returnUrl = `/jobs/${jobId}`;
      navigate(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    
    // User is authenticated, show application form
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
            Apply Now
          </>
        ) : (
          <>
            <User className="h-4 w-4 mr-2" />
            Login to Apply
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {showApplicationForm && currentUser && (
        <SimpleJobApplicationDialog
          open={showApplicationForm}
          onOpenChange={setShowApplicationForm}
          job={job}
        />
      )}
    </>
  );
};
