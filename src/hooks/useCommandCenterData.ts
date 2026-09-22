import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SavedATSReport {
  fileName: string;
  score: number;
  grade: string;
  foundKeywords: string[];
}

export interface TopJobMatch {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  seo_slug: string | null;
  skills_required: string[] | null;
  matchPercentage: number | null;
  matchedCount: number;
  totalCount: number;
  matchedSkills: string[];
  badgeLabel: string;
}

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
  savedAtsReport: SavedATSReport | null;
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
  topJobMatches: TopJobMatch[];
}

/**
 * Normalizes skill strings for reliable intersection:
 * lowercase, removes non-alphanumeric (except + and # for C++, C#),
 * strips common extensions like '.js'.
 */
export function normalizeSkill(skill: string): string {
  if (!skill) return '';
  let s = skill.toLowerCase().trim();
  if (s.endsWith('.js')) s = s.slice(0, -3);
  return s.replace(/[^a-z0-9+#]/g, '');
}

/**
 * Safely reads the pre-login ATS scan audit from sessionStorage.
 * This is treated strictly as temporary enrichment and is NOT persisted to DB.
 */
function getSessionAtsReport(): SavedATSReport | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('txc_saved_ats_report');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.score === 'number') {
      return {
        fileName: parsed.fileName || 'Scanned_Resume.pdf',
        score: parsed.score,
        grade: parsed.grade || 'B',
        foundKeywords: Array.isArray(parsed.foundKeywords) ? parsed.foundKeywords : []
      };
    }
  } catch (err) {
    console.warn('Could not parse txc_saved_ats_report:', err);
  }
  return null;
}

async function fetchCommandCenterData(userId: string): Promise<CommandCenterData> {
  const savedAtsReport = getSessionAtsReport();

  const [profileRes, appsRes, savedRes, viewsRes, TalentNetworkRes, activeJobsRes] = await Promise.all([
    // Profile + TalentScore + skills
    supabase
      .from('profiles')
      .select('id, full_name, title, current_company, profile_picture_url, talent_score, txc_coins, streak_days, profile_completion, skills')
      .eq('id', userId)
      .single(),

    // Application count + recent applications
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

    // Profile views count
    supabase
      .from('profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', userId),

    // TalentNetwork / Connections count
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted'),

    // Active Jobs for skill-based matching (explicit fields, bounded to 20)
    supabase
      .from('jobs')
      .select('id, title, company_name, location, salary_min, salary_max, employment_type, seo_slug, skills_required, posted_at')
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(20),
  ]);

  // Aggregate candidate skills from profile + temporary ATS audit
  const rawCandidateSkills: string[] = [
    ...(profileRes.data?.skills ?? []),
    ...(savedAtsReport?.foundKeywords ?? [])
  ];

  // Build candidate skill map: normalized -> original string
  const candidateSkillMap = new Map<string, string>();
  for (const s of rawCandidateSkills) {
    if (typeof s === 'string' && s.trim()) {
      candidateSkillMap.set(normalizeSkill(s), s.trim());
    }
  }

  // Calculate transparent skill overlap for each active job
  const activeJobs = activeJobsRes.data ?? [];
  const scoredJobs: TopJobMatch[] = activeJobs.map((job) => {
    const rawRequired: string[] = Array.isArray(job.skills_required) ? job.skills_required : [];
    const normalizedRequired = rawRequired.map(normalizeSkill).filter(Boolean);
    const totalRequired = normalizedRequired.length;

    let matchedSkills: string[] = [];
    let matchPercentage: number | null = null;
    let matchedCount = 0;

    if (totalRequired > 0 && candidateSkillMap.size > 0) {
      // Find intersection: candidateSkills ∩ jobRequiredSkills
      matchedSkills = rawRequired.filter(raw => candidateSkillMap.has(normalizeSkill(raw)));
      matchedCount = matchedSkills.length;
      
      // Transparent overlap percentage: matched / total * 100
      matchPercentage = Math.round((matchedCount / totalRequired) * 100);
    }

    // Honest labeling: If structured required skills exist and matched, show exact evidence
    let badgeLabel = 'Actively Hiring';
    if (matchPercentage !== null && matchPercentage > 0) {
      badgeLabel = `${matchPercentage}% skill match · ${matchedCount} of ${totalRequired} required skills`;
    } else if (totalRequired === 0 && candidateSkillMap.size > 0) {
      // Check title overlap if no structured skills available
      const titleLower = job.title.toLowerCase();
      const titleMatches = Array.from(candidateSkillMap.values()).filter(
        skill => skill.length > 2 && titleLower.includes(skill.toLowerCase())
      );
      if (titleMatches.length > 0) {
        matchedSkills = titleMatches;
        badgeLabel = `Role Alignment (${titleMatches.slice(0, 2).join(', ')})`;
      } else {
        badgeLabel = 'Curated for you';
      }
    } else {
      badgeLabel = 'Actively Hiring';
    }

    return {
      id: job.id,
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      employment_type: job.employment_type,
      seo_slug: job.seo_slug,
      skills_required: job.skills_required,
      matchPercentage,
      matchedCount,
      totalCount: totalRequired,
      matchedSkills,
      badgeLabel,
    };
  });

  // Sort genuine skill matches first (descending by percentage), then by recency
  scoredJobs.sort((a, b) => {
    const aScore = a.matchPercentage ?? -1;
    const bScore = b.matchPercentage ?? -1;
    if (aScore !== bScore) {
      return bScore - aScore;
    }
    return 0;
  });

  return {
    profile: profileRes.data ?? null,
    savedAtsReport,
    stats: {
      applicationsTotal: appsRes.count ?? 0,
      savedJobsTotal: savedRes.count ?? 0,
      profileViews: viewsRes.count ?? 0,
      TalentNetwork: TalentNetworkRes.count ?? 0,
    },
    recentApplications: (appsRes.data ?? []) as CommandCenterData['recentApplications'],
    topJobMatches: scoredJobs.slice(0, 4),
  };
}

export function useCommandCenterData(userId: string | undefined) {
  // Check session storage report to include in query cache key
  const atsScore = typeof window !== 'undefined' 
    ? (getSessionAtsReport()?.score ?? 0) 
    : 0;

  return useQuery({
    queryKey: ['command-center', userId, atsScore],
    queryFn: () => fetchCommandCenterData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,   // 2 min — fresh enough for CommandCenter
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}



