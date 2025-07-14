import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobMatchingRequest {
  jobs: any[];
  userId: string;
}

interface UserProfile {
  id: string;
  title?: string;
  skills?: string[];
  experience_years?: number;
  location?: string;
  preferences?: any;
  industry?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { jobs, userId }: JobMatchingRequest = await req.json();

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Enhanced job matching with AI analysis
    const enhancedJobs = jobs.map(job => {
      const matchResult = calculateJobMatch(job, userProfile);
      return {
        ...job,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons,
        gapAreas: matchResult.gaps
      };
    });

    // Sort by match score
    enhancedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return new Response(
      JSON.stringify({ enhancedJobs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-job-matcher:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function calculateJobMatch(job: any, userProfile: UserProfile) {
  let score = 0;
  const reasons: string[] = [];
  const gaps: string[] = [];
  const maxScore = 100;

  // Title/Role matching (25 points)
  const titleScore = calculateTitleMatch(job.title, userProfile.title || '');
  score += titleScore;
  if (titleScore > 15) {
    reasons.push(`Your ${userProfile.title} experience aligns well with this ${job.title} role`);
  } else if (titleScore < 8) {
    gaps.push(`Consider developing skills for ${job.title} roles`);
  }

  // Skills matching (35 points)
  const skillsResult = calculateSkillsMatch(job.skills_required || [], userProfile.skills || []);
  score += skillsResult.score;
  reasons.push(...skillsResult.reasons);
  gaps.push(...skillsResult.gaps);

  // Experience level matching (20 points)
  const expScore = calculateExperienceMatch(job.experience_level, userProfile.experience_years || 0);
  score += expScore;
  if (expScore > 15) {
    reasons.push(`Your ${userProfile.experience_years} years of experience matches the requirement`);
  } else if (expScore < 8) {
    gaps.push(`This role may require more experience than you currently have`);
  }

  // Location matching (10 points)
  const locationScore = calculateLocationMatch(job.location, userProfile.location || '');
  score += locationScore;
  if (locationScore > 8) {
    reasons.push(`Location matches your preferences`);
  }

  // Industry matching (10 points)
  const industryScore = calculateIndustryMatch(job.companies?.industry || '', userProfile.industry || '');
  score += industryScore;
  if (industryScore > 7) {
    reasons.push(`Industry aligns with your background`);
  }

  return {
    score: Math.min(Math.round(score), 100),
    reasons: reasons.slice(0, 5),
    gaps: gaps.slice(0, 3)
  };
}

function calculateTitleMatch(jobTitle: string, userTitle: string): number {
  if (!jobTitle || !userTitle) return 5;
  
  const jobTitleLower = jobTitle.toLowerCase();
  const userTitleLower = userTitle.toLowerCase();
  
  // Exact match
  if (jobTitleLower === userTitleLower) return 25;
  
  // Partial matches
  const jobWords = jobTitleLower.split(/\s+/);
  const userWords = userTitleLower.split(/\s+/);
  
  let matchCount = 0;
  for (const jobWord of jobWords) {
    for (const userWord of userWords) {
      if (jobWord.includes(userWord) || userWord.includes(jobWord)) {
        matchCount++;
        break;
      }
    }
  }
  
  const matchRatio = matchCount / Math.max(jobWords.length, userWords.length);
  return Math.round(matchRatio * 25);
}

function calculateSkillsMatch(requiredSkills: string[], userSkills: string[]) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 20, reasons: [], gaps: [] };
  }
  
  const reasons: string[] = [];
  const gaps: string[] = [];
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
  
  let matchedSkills = 0;
  const matchedSkillNames: string[] = [];
  
  for (const required of requiredSkillsLower) {
    let found = false;
    for (const userSkill of userSkillsLower) {
      if (userSkill.includes(required) || required.includes(userSkill)) {
        matchedSkills++;
        matchedSkillNames.push(required);
        found = true;
        break;
      }
    }
    if (!found) {
      gaps.push(`Learn ${required} to strengthen your application`);
    }
  }
  
  const matchRatio = matchedSkills / requiredSkills.length;
  const score = Math.round(matchRatio * 35);
  
  if (matchedSkills > 0) {
    reasons.push(`You have ${matchedSkills}/${requiredSkills.length} required skills: ${matchedSkillNames.slice(0, 3).join(', ')}`);
  }
  
  return { score, reasons, gaps: gaps.slice(0, 2) };
}

function calculateExperienceMatch(requiredLevel: string | undefined, userYears: number): number {
  if (!requiredLevel) return 15;
  
  const level = requiredLevel.toLowerCase();
  
  if (level.includes('entry') || level.includes('junior')) {
    return userYears <= 2 ? 20 : userYears <= 4 ? 15 : 10;
  } else if (level.includes('mid') || level.includes('intermediate')) {
    return userYears >= 2 && userYears <= 6 ? 20 : Math.max(0, 15 - Math.abs(userYears - 4) * 2);
  } else if (level.includes('senior')) {
    return userYears >= 5 ? 20 : Math.max(0, 10 - (5 - userYears) * 2);
  } else if (level.includes('lead') || level.includes('principal')) {
    return userYears >= 7 ? 20 : Math.max(0, 8 - (7 - userYears));
  }
  
  return 10; // Default score
}

function calculateLocationMatch(jobLocation: string, userLocation: string): number {
  if (!jobLocation || !userLocation) return 5;
  
  const jobLoc = jobLocation.toLowerCase();
  const userLoc = userLocation.toLowerCase();
  
  // Remote work
  if (jobLoc.includes('remote') || jobLoc.includes('anywhere')) return 10;
  
  // Exact city match
  if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) return 10;
  
  // Same country/state (basic implementation)
  const jobParts = jobLoc.split(',').map(s => s.trim());
  const userParts = userLoc.split(',').map(s => s.trim());
  
  for (const jobPart of jobParts) {
    for (const userPart of userParts) {
      if (jobPart === userPart) return 6;
    }
  }
  
  return 2;
}

function calculateIndustryMatch(jobIndustry: string, userIndustry: string): number {
  if (!jobIndustry || !userIndustry) return 5;
  
  const jobInd = jobIndustry.toLowerCase();
  const userInd = userIndustry.toLowerCase();
  
  if (jobInd === userInd) return 10;
  if (jobInd.includes(userInd) || userInd.includes(jobInd)) return 7;
  
  return 3;
}