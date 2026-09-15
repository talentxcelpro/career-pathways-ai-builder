import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface TalentBeaconMatch {
  id: string;
  job_id: string;
  match_score: number;
  matching_factors: string[];
  skill_gaps: string[];
  salary_comparison?: any;
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    salary_range: string;
    description: string;
  };
}

export interface BeaconScanResult {
  status: 'matches' | 'no_matches' | 'no_jobs' | 'error';
  matchesProcessed: number;
  message: string;
}

function toSkillArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((skill) => skill.trim()).filter(Boolean);
  }
  return [];
}

function scoreJobLocally(job: any, profile: any, resume: any, userId: string) {
  const profileSkills = toSkillArray(profile?.skills);
  const requiredSkills = toSkillArray(job?.skills_required);
  const haystack = `${job?.title || ''} ${job?.description || ''}`.toLowerCase();
  const matchedSkills = profileSkills.filter((skill) => haystack.includes(skill.toLowerCase()));
  const explicitMatches = requiredSkills.filter((skill) =>
    profileSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())
  );
  const allMatches = [...new Set([...matchedSkills, ...explicitMatches])];
  const gaps = requiredSkills
    .filter((skill) => !allMatches.some((match) => match.toLowerCase() === skill.toLowerCase()))
    .slice(0, 5);
  const resumeBoost = resume?.content ? 8 : 0;
  const titleBoost = profile?.title && haystack.includes(String(profile.title).toLowerCase()) ? 10 : 0;
  const baseScore = requiredSkills.length
    ? Math.round((allMatches.length / requiredSkills.length) * 55)
    : Math.min(35, allMatches.length * 8);
  const matchScore = Math.max(45, Math.min(92, 45 + baseScore + resumeBoost + titleBoost));

  return {
    user_id: userId,
    job_id: job.id,
    match_score: matchScore,
    matching_factors: [
      allMatches.length
        ? `Matched skills: ${allMatches.slice(0, 5).join(', ')}`
        : 'Role aligns with your available profile signals',
      profile?.title ? `Target role context: ${profile.title}` : 'Profile can be strengthened with a target title',
      resume?.content ? 'Latest resume context included in match' : 'Add a primary resume to improve precision',
    ],
    skill_gaps: gaps,
    updated_at: new Date().toISOString()
  };
}

export const useReverseJobMatch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  // Fetch existing matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['talent-beacon-matches', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_job_matches')
        .select(`
          id,
          match_score,
          matching_factors,
          skill_gaps,
          salary_comparison,
          job_id,
          jobs (
            id, title, company, location, employment_type, salary_range, description
          )
        `)
        .eq('user_id', user.id)
        .order('match_score', { ascending: false });

      if (error) throw error;
      
      // Filter out matches where jobs might be null (if job was deleted)
      return (data || []).filter(item => item.jobs) as unknown as TalentBeaconMatch[];
    }
  });

  const startBeaconScan = async (): Promise<BeaconScanResult> => {
    if (!user?.id) {
      return {
        status: 'error',
        matchesProcessed: 0,
        message: 'Please sign in before starting a Talent Beacon scan.',
      };
    }
    
    setIsScanning(true);
    const toastId = toast.loading('Beacon is scanning the market for matches...');

    try {
      // 1. Get user profile and latest resume
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, bio, title, industry')
        .eq('id', user.id)
        .single();

      const { data: resume } = await supabase
        .from('ai_resumes')
        .select('content')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      // 2. Get top 10 recent jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company, description, skills_required')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!jobs || jobs.length === 0) {
        toast.error('No active jobs found to match against.', { id: toastId });
        return {
          status: 'no_jobs',
          matchesProcessed: 0,
          message: 'No active jobs are available to match against right now.',
        };
      }

      // Match the latest active jobs in parallel and persist the scored results.
      const matchPromises = jobs.map(async (job) => {
        try {
          const prompt = `
            User Profile: ${profile?.title} in ${profile?.industry}. Skills: ${toSkillArray(profile?.skills).join(', ')}. Bio: ${profile?.bio}
            Resume Context: ${JSON.stringify(resume?.content || {})}
            
            Job to Match: ${job.title} at ${job.company}.
            Job Description: ${job.description}
            Skills Required: ${toSkillArray(job.skills_required).join(', ')}
          `;

          const { data, error } = await supabase.functions.invoke('ai-service-matching', {
            body: { 
              message: prompt, 
              serviceType: 'job_matching' 
            }
          });

          if (error) throw error;

          // Parse the AI response (which should be JSON based on the system prompt)
          let matchData;
          try {
            // The edge function returns { response: "..." }
            // We need to extract the JSON from the string if it's wrapped in code blocks
            const jsonStr = data.response.replace(/```json|```/g, '').trim();
            matchData = JSON.parse(jsonStr);
          } catch (e) {
            console.error('Failed to parse AI match data:', e, data.response);
            return null;
          }

          return {
            user_id: user.id,
            job_id: job.id,
            match_score: matchData.match_score || 0,
            matching_factors: matchData.match_reasons || [],
            skill_gaps: matchData.skill_gap_analysis || [],
            updated_at: new Date().toISOString()
          };
        } catch (err) {
          console.warn(`Precision Match failed for job ${job.id}; using local match scoring:`, err);
          return scoreJobLocally(job, profile, resume, user.id);
        }
      });

      const results = (await Promise.all(matchPromises)).filter(Boolean);

      if (results.length > 0) {
        // 4. Upsert into ai_job_matches
        const { error: upsertError } = await supabase
          .from('ai_job_matches')
          .upsert(results, { onConflict: 'user_id,job_id' });

        if (upsertError) throw upsertError;

        toast.success(`Beacon found ${results.length} highly relevant matches!`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ['talent-beacon-matches'] });
        return {
          status: 'matches',
          matchesProcessed: results.length,
          message: `Beacon found ${results.length} relevant matches.`,
        };
      } else {
        toast.info('Beacon scanned but found no high-confidence matches at this time.', { id: toastId });
        return {
          status: 'no_matches',
          matchesProcessed: 0,
          message: 'Beacon scanned active jobs but found no high-confidence matches yet.',
        };
      }

    } catch (error) {
      console.error('Beacon scan failed:', error);
      toast.error('Beacon scan failed. Please try again.', { id: toastId });
      return {
        status: 'error',
        matchesProcessed: 0,
        message: 'Beacon scan failed. Please try again.',
      };
    } finally {
      setIsScanning(false);
    }
  };

  return {
    matches,
    isLoading,
    isScanning,
    startBeaconScan
  };
};

