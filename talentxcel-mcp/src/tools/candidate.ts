// src/tools/candidate.ts — Candidate Intelligence tools (Group B)
// Verified DB tables: `profiles`, `cv_database`, `jobs`

import { z } from "zod";
import { createUserSupabase, createPublicSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

// 5. search_candidates
export const SearchCandidatesInput = z.object({
  skills: z.array(z.string().trim().max(50)).min(1).max(10).describe("Skills to filter candidate pool"),
  location: z.string().trim().max(100).optional().describe("Location preference"),
  min_experience_years: z.number().int().min(0).max(30).optional().describe("Minimum years of experience"),
  limit: z.number().int().min(1).max(30).default(10),
  offset: z.number().int().min(0).default(0),
});

export async function searchCandidates(input: z.infer<typeof SearchCandidatesInput>, auth: AuthContext) {
  // Authorization check: Only authenticated users with employer/admin role or active session
  if (!auth.isAuthenticated || !auth.token) {
    throw new Error("Authentication required: Employer or Recruiter session required to search candidate database.");
  }

  const sb = createUserSupabase(auth.token);

  // Query profiles that opted in for job search / public visibility
  let q = sb
    .from("profiles")
    .select("id, full_name, headline, bio, location, skills, experience_years, current_job_title, current_company, is_profile_public, looking_for_job", { count: "exact" })
    .or("is_profile_public.eq.true,looking_for_job.eq.true")
    .range(input.offset, input.offset + input.limit - 1);

  if (input.location) {
    q = q.ilike("location", `%${input.location}%`);
  }
  if (input.min_experience_years !== undefined) {
    q = q.gte("experience_years", input.min_experience_years);
  }
  if (input.skills && input.skills.length > 0) {
    q = q.overlaps("skills", input.skills);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(`Candidate search failed: ${error.message}`);

  // Redact PII (no phone, no email) to respect candidate privacy / DPDP compliance
  const candidates = (data ?? []).map((c: Record<string, unknown>) => ({
    candidate_id: c.id,
    display_name: auth.role === "employer" || auth.role === "admin" ? c.full_name : `${String(c.full_name || "Candidate").split(" ")[0]} ***`,
    headline: c.headline || c.current_job_title,
    location: c.location,
    experience_years: c.experience_years ?? 0,
    current_company: c.current_company,
    skills: c.skills ?? [],
    open_to_opportunities: c.looking_for_job ?? true,
    privacy_status: "Verified TalentXcel Profile (PII Protected)",
  }));

  return {
    total: count ?? candidates.length,
    offset: input.offset,
    limit: input.limit,
    candidates,
  };
}

// 6. get_candidate_profile
export const GetCandidateProfileInput = z.object({
  candidate_id: z.string().uuid().optional().describe("Optional candidate UUID. If omitted, returns authenticated user's own profile."),
});

export async function getCandidateProfile(input: z.infer<typeof GetCandidateProfileInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required to access candidate profile.");
  }

  const targetId = input.candidate_id || auth.userId;
  const isOwnProfile = targetId === auth.userId;
  const isAuthorizedRecruiter = auth.role === "employer" || auth.role === "admin";

  const sb = createUserSupabase(auth.token);

  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, full_name, headline, bio, location, skills, experience_years, current_job_title, current_company, is_profile_public, looking_for_job, resume_url, created_at, updated_at")
    .eq("id", targetId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  if (!profile) throw new Error(`Candidate profile not found: ${targetId}`);

  // Privacy gate: If not own profile and not public and requester is not employer/admin, deny
  if (!isOwnProfile && !profile.is_profile_public && !isAuthorizedRecruiter) {
    throw new Error("Access restricted: Candidate profile is private.");
  }

  return {
    is_own_profile: isOwnProfile,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      headline: profile.headline || profile.current_job_title,
      bio: profile.bio,
      location: profile.location,
      skills: profile.skills ?? [],
      experience_years: profile.experience_years ?? 0,
      current_job_title: profile.current_job_title,
      current_company: profile.current_company,
      resume_available: !!profile.resume_url,
      open_to_work: profile.looking_for_job ?? true,
    },
  };
}

// 7. match_candidate_to_jobs
export const MatchCandidateToJobsInput = z.object({
  limit: z.number().int().min(1).max(20).default(5).describe("Number of matching jobs to return"),
});

export async function matchCandidateToJobs(input: z.infer<typeof MatchCandidateToJobsInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required for AI job matching.");
  }

  const sb = createUserSupabase(auth.token);
  const { data: profile, error: pError } = await sb
    .from("profiles")
    .select("skills, headline, current_job_title, experience_years, preferred_locations")
    .eq("id", auth.userId)
    .maybeSingle();

  if (pError || !profile) throw new Error("Could not retrieve user skills for matching.");

  const userSkills: string[] = Array.isArray(profile.skills) ? profile.skills : [];
  if (userSkills.length === 0) {
    return {
      matches: [],
      message: "No skills found on profile. Add skills to your TalentXcel profile to enable job matching.",
    };
  }

  const { data: jobs, error: jError } = await createPublicSupabase()
    .from("jobs")
    .select("id, title, company_name, location, skills_required, min_experience, max_experience, salary_range, external_url")
    .eq("is_active", true)
    .overlaps("skills_required", userSkills.slice(0, 10))
    .limit(input.limit * 2);

  if (jError) throw new Error(`Job matching query failed: ${jError.message}`);

  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  const ranked = (jobs ?? []).map((j: Record<string, unknown>) => {
    const jobSkills: string[] = Array.isArray(j.skills_required) ? (j.skills_required as string[]) : [];
    const matched = userSkills.filter(us => jobSkills.some(js => js.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(js.toLowerCase())));
    const missing = jobSkills.filter(js => !userSkillsLower.some(us => us.includes(js.toLowerCase()) || js.toLowerCase().includes(us)));
    const matchScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 50;

    return {
      job_id: j.id,
      title: j.title,
      company: j.company_name,
      location: j.location,
      salary_range: j.salary_range,
      application_url: j.external_url,
      match_percentage: matchScore,
      skill_overlap: matched,
      missing_skills: missing,
    };
  }).sort((a, b) => b.match_percentage - a.match_percentage).slice(0, input.limit);

  return {
    candidate_skills: userSkills,
    total_matches_found: ranked.length,
    matches: ranked,
  };
}

// 8. calculate_skill_gap
export const CalculateSkillGapInput = z.object({
  target_role: z.string().trim().min(1).max(100).describe("Target job role or title (e.g. 'Senior Fullstack Engineer', 'Data Scientist')"),
});

export async function calculateSkillGap(input: z.infer<typeof CalculateSkillGapInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required for skill gap calculation.");
  }

  const sb = createUserSupabase(auth.token);
  const { data: profile } = await sb
    .from("profiles")
    .select("skills, headline, experience_years")
    .eq("id", auth.userId)
    .maybeSingle();

  const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : [];
  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  // Sample actual active job requirements for the target role
  const { data: jobs } = await createPublicSupabase()
    .from("jobs")
    .select("skills_required")
    .or(`title.ilike.%${input.target_role}%,job_title.ilike.%${input.target_role}%`)
    .eq("is_active", true)
    .limit(25);

  const freq = new Map<string, number>();
  (jobs ?? []).forEach((j: Record<string, unknown>) => {
    (Array.isArray(j.skills_required) ? (j.skills_required as string[]) : []).forEach(s => {
      const normalized = s.trim();
      if (normalized.length > 1) {
        freq.set(normalized, (freq.get(normalized) || 0) + 1);
      }
    });
  });

  const benchmarkSkills = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({ skill, frequency_in_postings: count }));

  const presentSkills = benchmarkSkills.filter(b => userSkillsLower.some(us => us.includes(b.skill.toLowerCase()) || b.skill.toLowerCase().includes(us))).map(b => b.skill);
  const missingSkills = benchmarkSkills.filter(b => !userSkillsLower.some(us => us.includes(b.skill.toLowerCase()) || b.skill.toLowerCase().includes(us))).map(b => b.skill);

  const readinessScore = benchmarkSkills.length > 0 ? Math.round((presentSkills.length / benchmarkSkills.length) * 100) : 0;

  return {
    target_role: input.target_role,
    readiness_percentage: readinessScore,
    user_skills_evaluated: userSkills,
    skills_possessed: presentSkills,
    missing_competencies: missingSkills,
    recommended_priority_actions: missingSkills.slice(0, 4).map(skill => `Acquire practical project experience or certification in ${skill}`),
  };
}
