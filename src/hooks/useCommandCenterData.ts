import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommandCenterData {
  profile: {
    id: string;
    full_name: string | null;
    title: string | null;
    current_company: string | null;
    profile_picture_url: string | null;
    talent_score: number;
    txc_coins: number | null;
    streak_days: number | null;
    profile_completion: number | null;
    skills: string[] | null;
  } | null;
  stats: {
    applicationsTotal: number;
    savedJobsTotal: number;
    profileViews: number;
    TalentNetwork: number;
  };
  recentApplications: Array<{
    id: string;
    status: string;
    created_at: string;
    jobs: { title: string; companies: { name: string } | null } | null;
  }>;
  topJobMatches: Array<{
    id: string;
    title: string;
    company_name: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    employment_type: string | null;
    seo_slug: string | null;
  }>;
}

async function fetchCommandCenterData(userId: string): Promise<CommandCenterData> {
  const [profileRes, appsRes, savedRes, viewsRes, TalentNetworkRes, jobMatchesRes] = await Promise.all([
    // Profile + TalentScore
    supabase
      .from('profiles')
      .select('id, full_name, title, current_company, profile_picture_url, talent_score, txc_coins, streak_days, profile_completion, skills')
      .eq('id', userId)
      .single(),

    // Application count
    supabase
      .from('enhanced_job_applications')
      .select('id, status, created_at, jobs(title, companies(name))', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),

    // Saved jobs count
    supabase
      .from('saved_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),

    // Profile views
    supabase
      .from('profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', userId),

    // TalentNetwork count
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted'),

    // Top recent jobs (simple match by recency for now)
    supabase
      .from('jobs')
      .select('id, title, company_name, location, salary_min, salary_max, employment_type, seo_slug')
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(4),
  ]);

  return {
    profile: profileRes.data ?? null,
    stats: {
      applicationsTotal: appsRes.count ?? 0,
      savedJobsTotal: savedRes.count ?? 0,
      profileViews: viewsRes.count ?? 0,
      TalentNetwork: TalentNetworkRes.count ?? 0,
    },
    recentApplications: (appsRes.data ?? []) as CommandCenterData['recentApplications'],
    topJobMatches: (jobMatchesRes.data ?? []) as CommandCenterData['topJobMatches'],
  };
}

export function useCommandCenterData(userId: string | undefined) {
  return useQuery({
    queryKey: ['command-center', userId],
    queryFn: () => fetchCommandCenterData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,   // 2 min — fresh enough for CommandCenter
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}



