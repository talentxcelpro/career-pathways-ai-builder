import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SwipeableJobCard } from '@/components/jobs/SwipeableJobCard';
import { GlobalSearch } from '@/components/jobs/GlobalSearch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEOHead } from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const MobileJobs: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    skills: [] as string[],
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch jobs optimized for mobile
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['mobile_jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            industry
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false })
        .limit(50);

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Handle job actions
  const handleSaveJob = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      await supabase
        .from('saved_jobs')
        .insert({ user_id: currentUser.id, job_id: jobId });
      
      // Award TXC coins
      await supabase.rpc('update_user_txc_coins', {
        user_uuid: currentUser.id,
        coin_change: 5,
        reason: 'job_saved'
      });
      
      toast.success('Job saved! +5 TXC coins earned');
    } catch (error) {
      console.error('Save job error:', error);
      toast.error('Failed to save job');
    }
  };

  const handleQuickApply = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please login to apply');
      return;
    }

    try {
      // Award TXC coins
      await supabase.rpc('update_user_txc_coins', {
        user_uuid: currentUser.id,
        coin_change: 10,
        reason: 'job_application'
      });
      
      toast.success('Quick Apply submitted! +10 TXC coins earned');
      setSwipeIndex(prev => prev + 1);
    } catch (error) {
      console.error('Quick apply error:', error);
      toast.error('Failed to apply');
    }
  };

  const handleRejectJob = async (jobId: string) => {
    // Award coins for engagement
    if (currentUser) {
      try {
        await supabase.rpc('update_user_txc_coins', {
          user_uuid: currentUser.id,
          coin_change: 2,
          reason: 'job_engagement'
        });
        
        toast.success('Job rejected! +2 TXC coins for engagement');
      } catch (error) {
        console.error('Reject job error:', error);
      }
    }
    
    setSwipeIndex(prev => prev + 1);
  };

  const handleJobApplication = async (jobId: string, applicationData: any) => {
    if (!currentUser) {
      toast.error('Please login to apply');
      return;
    }

    try {
      const { error } = await supabase
        .from('enhanced_job_applications')
        .insert({
          user_id: currentUser.id,
          job_id: jobId,
          status: 'applied',
          current_role: applicationData.currentRole,
          current_ctc: applicationData.currentCTC ? parseFloat(applicationData.currentCTC) * 100000 : null,
          expected_ctc: applicationData.expectedCTC ? parseFloat(applicationData.expectedCTC) * 100000 : null,
          notice_period: applicationData.noticePeriod,
          preferred_location: applicationData.location,
          resume_url: applicationData.resumeUrl,
          application_data: applicationData
        });

      if (error) throw error;

      // Award TXC coins
      await supabase.rpc('update_user_txc_coins', {
        user_uuid: currentUser.id,
        coin_change: 10,
        reason: 'job_application'
      });

      toast.success('Application submitted! +10 TXC coins earned');
      setSwipeIndex(prev => prev + 1);
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Mobile Jobs - Swipe to Find Your Dream Job | TalentXcel"
        description="Discover jobs with mobile-optimized swipe interface. Save time with instant apply and earn TXC coins for every interaction."
        keywords={['mobile jobs', 'swipe jobs', 'job search', 'instant apply', 'TalentXcel']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
        {/* Mobile Search Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20 px-4 py-3">
          <GlobalSearch
            value={filters.search}
            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            onSearch={() => {}}
            onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            placeholder="Search jobs..."
            recentJobs={jobs.slice(0, 3)}
          />
        </div>

        {/* Reverse Job Match / Talent Beacon Banner */}
        <div className="px-4 pt-4 pb-2">
          <Link 
            to="/talent-beacon"
            className="flex items-center gap-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl shadow-md press-effect relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0 border border-blue-400/30">
              <Zap className="w-5 h-5 text-blue-200 fill-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-tight">Talent Beacon Active</h3>
              <p className="text-blue-200 text-[13px] mt-0.5">Companies are looking for you. View matches.</p>
            </div>
          </Link>
        </div>

        {/* Mobile Job Cards */}
        <div className="px-4 py-4">
          {jobs.length > 0 ? (
            <SwipeableJobCard
              jobs={jobs}
              currentIndex={swipeIndex}
              onSave={handleSaveJob}
              onQuickApply={handleQuickApply}
              onReject={handleRejectJob}
              onApplication={handleJobApplication}
              isLoggedIn={!!currentUser}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileJobs;