import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

export interface TalentScoreCategory {
  key: string;
  label: string;
  score: number;
  max: number;
  summary: string;
  signals: string[];
}

export interface TalentScoreRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  route: string;
  category: string;
}

export interface TalentScoreBreakdown {
  profile: { score: number; max: number; label: string };
  skills: { score: number; max: number; label: string };
  network: { score: number; max: number; label: string };
  learning: { score: number; max: number; label: string };
  activity: { score: number; max: number; label: string };
}

export interface LegacyTalentScore {
  total: number;
  maxTotal: number;
  grade: string;
  gradeColor: string;
  weeklyDelta: number;
  percentile: number;
  breakdown: TalentScoreBreakdown;
  topActions: Array<{
    title: string;
    description: string;
    points: number;
    icon: string;
    route: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface TalentScoreRecord {
  id: string;
  user_id: string;
  score: number;
  previous_score: number | null;
  delta: number;
  percentile: number;
  band: 'Building' | 'Emerging' | 'Strong' | 'Elite';
  breakdown: TalentScoreCategory[];
  signals: Record<string, number | string | boolean | null>;
  recommendations: TalentScoreRecommendation[];
  computed_at: string;
  created_at: string;
}

interface TalentScoreResponse {
  talentScore: TalentScoreRecord;
  cached: boolean;
}

function clampScore(value: number, max: number) {
  return Math.min(max, Math.max(0, Math.round(value)));
}

function buildRecommendations(profile: any, skillsCount: number, TalentNetwork: number): TalentScoreRecommendation[] {
  const recommendations: TalentScoreRecommendation[] = [];

  if (!profile?.title && !profile?.current_job_title) {
    recommendations.push({
      id: 'add-role',
      title: 'Add your target role',
      description: 'A clear title helps TalentXcel rank jobs, people, and learning paths around your next move.',
      impact: 45,
      route: '/profile',
      category: 'experience',
    });
  }

  if (skillsCount < 8) {
    recommendations.push({
      id: 'add-skills',
      title: 'Add more verified skills',
      description: 'List at least 8 current skills so matching can separate strong roles from noisy ones.',
      impact: 50,
      route: '/profile',
      category: 'skills',
    });
  }

  if (TalentNetwork < 20) {
    recommendations.push({
      id: 'grow-network',
      title: 'Build your referral graph',
      description: 'Follow and connect with people at target companies to improve your warm-intro signal.',
      impact: 35,
      route: '/network',
      category: 'network',
    });
  }

  recommendations.push({
    id: 'scan-market',
    title: 'Run a Talent Beacon scan',
    description: 'Find roles where your current profile already has a strong match and clear gap path.',
    impact: 40,
    route: '/talent-beacon',
    category: 'learning',
  });

  return recommendations.slice(0, 4);
}

async function fetchLocalTalentScore(): Promise<TalentScoreResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('TalentScore requires a signed-in user');

  const [profileRes, TalentNetworkRes, postsRes, resumesRes, matchesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq('status', 'accepted'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).or(`author_id.eq.${user.id},user_id.eq.${user.id}`),
    supabase.from('ai_resumes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('ai_job_matches').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  if (profileRes.error) console.warn('Local TalentScore profile load failed:', profileRes.error);
  if (TalentNetworkRes.error) console.warn('Local TalentScore TalentNetwork load failed:', TalentNetworkRes.error);
  if (postsRes.error) console.warn('Local TalentScore posts load failed:', postsRes.error);
  if (resumesRes.error) console.warn('Local TalentScore resumes load failed:', resumesRes.error);
  if (matchesRes.error) console.warn('Local TalentScore matches load failed:', matchesRes.error);

  const profile = profileRes.data as any;
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const TalentNetwork = TalentNetworkRes.count ?? 0;
  const posts = postsRes.count ?? 0;
  const resumes = resumesRes.count ?? 0;
  const matches = matchesRes.count ?? 0;

  const experienceScore = clampScore(
    (profile?.full_name ? 35 : 0) +
      (profile?.title || profile?.current_job_title ? 55 : 0) +
      (profile?.bio ? 45 : 0) +
      (profile?.location ? 30 : 0) +
      (profile?.current_company ? 35 : 0) +
      (profile?.profile_picture_url || profile?.profile_photo_url ? 50 : 0),
    250
  );
  const skillsScore = clampScore(skills.length * 24, 300);
  const networkScore = clampScore(TalentNetwork * 4, 150);
  const learningScore = clampScore(resumes * 45 + matches * 12, 150);
  const achievementsScore = clampScore(posts * 18 + Math.min(60, matches * 4), 150);
  const score = clampScore(experienceScore + skillsScore + networkScore + learningScore + achievementsScore, 1000);

  const band: TalentScoreRecord['band'] = score >= 850 ? 'Elite' : score >= 700 ? 'Strong' : score >= 550 ? 'Emerging' : 'Building';
  const now = new Date().toISOString();

  return {
    cached: true,
    talentScore: {
      id: `local-${user.id}`,
      user_id: user.id,
      score,
      previous_score: null,
      delta: 0,
      percentile: clampScore(score / 10, 99),
      band,
      breakdown: [
        {
          key: 'experience',
          label: 'Profile',
          score: experienceScore,
          max: 250,
          summary: 'Profile completeness and role clarity',
          signals: ['Profile fields', 'role clarity', 'company context'],
        },
        {
          key: 'skills',
          label: 'Skills',
          score: skillsScore,
          max: 300,
          summary: 'Current skills depth and breadth',
          signals: [`${skills.length} skills listed`],
        },
        {
          key: 'network',
          label: 'Network',
          score: networkScore,
          max: 150,
          summary: 'Referral graph and trusted reach',
          signals: [`${TalentNetwork} accepted TalentNetwork`],
        },
        {
          key: 'learning',
          label: 'Learning',
          score: learningScore,
          max: 150,
          summary: 'Resume effort and market exploration',
          signals: [`${resumes} resumes`, `${matches} job matches`],
        },
        {
          key: 'achievements',
          label: 'Achievements',
          score: achievementsScore,
          max: 150,
          summary: 'Network activity and proof of work',
          signals: [`${posts} posts shared`],
        },
      ],
      signals: {
        skills: skills.length,
        TalentNetwork,
        posts,
        resumes,
        matches,
        nativeFallback: Capacitor.isNativePlatform(),
      },
      recommendations: buildRecommendations(profile, skills.length, TalentNetwork),
      computed_at: now,
      created_at: now,
    },
  };
}

async function fetchTalentScore(force = false) {
  if (Capacitor.isNativePlatform()) {
    return fetchLocalTalentScore();
  }

  const { data, error } = await supabase.functions.invoke<TalentScoreResponse>('compute-talent-score', {
    body: { force },
  });

  if (error || !data?.talentScore) {
    console.warn('Edge TalentScore unavailable, using local fallback:', error);
    return fetchLocalTalentScore();
  }

  return data;
}

function getGradeColor(band: TalentScoreRecord['band']) {
  switch (band) {
    case 'Elite':
      return '#10B981';
    case 'Strong':
      return '#007AFF';
    case 'Emerging':
      return '#FF9500';
    default:
      return '#64748B';
  }
}

function findCategory(record: TalentScoreRecord, key: string, fallback: { score: number; max: number; label: string }) {
  const category = record.breakdown.find((item) => item.key === key);
  if (!category) return fallback;

  return {
    score: category.score,
    max: category.max,
    label: category.label,
  };
}

function toLegacyTalentScore(record?: TalentScoreRecord): LegacyTalentScore | undefined {
  if (!record) return undefined;

  return {
    total: record.score,
    maxTotal: 1000,
    grade: record.band,
    gradeColor: getGradeColor(record.band),
    weeklyDelta: record.delta,
    percentile: record.percentile,
    breakdown: {
      profile: findCategory(record, 'experience', { score: 0, max: 250, label: 'Profile' }),
      skills: findCategory(record, 'skills', { score: 0, max: 300, label: 'Skills' }),
      network: findCategory(record, 'network', { score: 0, max: 150, label: 'Network' }),
      learning: findCategory(record, 'learning', { score: 0, max: 150, label: 'Learning' }),
      activity: findCategory(record, 'achievements', { score: 0, max: 150, label: 'Activity' }),
    },
    topActions: record.recommendations.map((item) => ({
      title: item.title,
      description: item.description,
      points: item.impact,
      icon: item.category === 'skills' ? 'SK' : item.category === 'network' ? 'NW' : item.category === 'learning' ? 'LR' : 'PR',
      route: item.route,
      priority: item.impact >= 50 ? 'high' : item.impact >= 35 ? 'medium' : 'low',
    })),
  };
}

export function useTalentScore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['talent-score', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTalentScore(false),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const recompute = useMutation({
    mutationFn: () => fetchTalentScore(true),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    data: toLegacyTalentScore(query.data?.talentScore),
    talentScore: query.data?.talentScore,
    cached: query.data?.cached ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    recompute: recompute.mutateAsync,
    isRecomputing: recompute.isPending,
  };
}


