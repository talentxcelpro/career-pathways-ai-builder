// src/tools/career.ts — Career Intelligence tools (Group D)
// Verified DB tables: `jobs`, `salary_data`, `profiles`

import { z } from "zod";
import { createUserSupabase, createPublicSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

// 13. career_path_recommendation
export const CareerPathInput = z.object({
  current_role: z.string().trim().max(100).optional().describe("Current role (optional; defaults to profile headline)"),
  target_role: z.string().trim().min(1).max(100).describe("Target career goal"),
});

export async function careerPathRecommendation(input: z.infer<typeof CareerPathInput>, auth: AuthContext) {
  let userHeadline = "Professional";
  let userSkills: string[] = [];
  let userExp = 0;

  if (auth.isAuthenticated && auth.token && auth.userId) {
    const sb = createUserSupabase(auth.token);
    const { data: profile } = await sb.from("profiles").select("headline, skills, experience_years").eq("id", auth.userId).maybeSingle();
    if (profile) {
      userHeadline = profile.headline || userHeadline;
      userSkills = profile.skills ?? [];
      userExp = profile.experience_years ?? 0;
    }
  }

  const resolvedCurrent = input.current_role || userHeadline;
  const sb = createPublicSupabase();

  // Inspect live market data for target role
  const { data: targetJobs } = await sb
    .from("jobs")
    .select("skills_required, min_experience, max_experience, title")
    .ilike("title", `%${input.target_role}%`)
    .eq("is_active", true)
    .limit(20);

  const targetSkillsSet = new Set<string>();
  (targetJobs ?? []).forEach((j: Record<string, unknown>) => {
    (Array.isArray(j.skills_required) ? (j.skills_required as string[]) : []).forEach(s => targetSkillsSet.add(s.trim()));
  });

  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const skillGaps = Array.from(targetSkillsSet).filter(s => !userSkillsLower.includes(s.toLowerCase())).slice(0, 8);

  return {
    pathway_overview: {
      current_baseline: resolvedCurrent,
      target_destination: input.target_role,
      estimated_progression_timeline: skillGaps.length <= 3 ? "3-6 months" : skillGaps.length <= 6 ? "6-12 months" : "12-24 months",
    },
    critical_skills_to_acquire: skillGaps,
    milestones: [
      { phase: "Stage 1: Core Competency", action: `Master primary competencies: ${skillGaps.slice(0, 3).join(", ") || "Advanced System Patterns"}` },
      { phase: "Stage 2: Applied Impact", action: "Build portfolio artifacts or lead end-to-end deliverables demonstrating these competencies." },
      { phase: "Stage 3: Market Transition", action: `Position resume and application narrative for ${input.target_role} roles.` },
    ],
  };
}

// 14. skill_recommendations
export const SkillRecommendationsInput = z.object({
  target_role: z.string().trim().min(1).max(100).describe("Target designation or domain"),
});

export async function skillRecommendations(input: z.infer<typeof SkillRecommendationsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  const { data: jobs, error } = await sb
    .from("jobs")
    .select("skills_required")
    .or(`title.ilike.%${input.target_role}%,job_title.ilike.%${input.target_role}%`)
    .eq("is_active", true)
    .limit(40);

  if (error) throw new Error(`Failed to query market skill demand: ${error.message}`);

  const counts = new Map<string, number>();
  (jobs ?? []).forEach((j: Record<string, unknown>) => {
    (Array.isArray(j.skills_required) ? (j.skills_required as string[]) : []).forEach(s => {
      const clean = s.trim();
      if (clean.length > 1) {
        counts.set(clean, (counts.get(clean) || 0) + 1);
      }
    });
  });

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, occurrences]) => ({
      skill,
      frequency_in_live_openings: occurrences,
      demand_level: occurrences > 8 ? "CRITICAL" : occurrences > 4 ? "HIGH" : "COMPLEMENTARY",
    }));

  return {
    target_role: input.target_role,
    jobs_sampled: jobs?.length ?? 0,
    skills_in_demand: ranked,
  };
}

// 15. salary_insights
export const SalaryInsightsInput = z.object({
  job_title: z.string().trim().min(1).max(100).describe("Role to analyze compensation for (e.g. 'Software Engineer')"),
  location: z.string().trim().max(100).optional().describe("Geographic market (e.g. 'Bangalore', 'Mumbai', 'Remote')"),
});

export async function salaryInsights(input: z.infer<typeof SalaryInsightsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();

  // Query verified salary_data table
  let salQuery = sb
    .from("salary_data")
    .select("job_title, location, experience_level, salary_range_min, salary_range_max, currency, salary_currency")
    .ilike("job_title", `%${input.job_title}%`);

  if (input.location) {
    salQuery = salQuery.ilike("location", `%${input.location}%`);
  }

  const { data: salaryDataRows } = await salQuery.limit(20);

  // Also query live jobs table for active salary ranges
  let jobQuery = sb
    .from("jobs")
    .select("title, salary_min, salary_max, salary_currency, salary_range, location")
    .or(`title.ilike.%${input.job_title}%,job_title.ilike.%${input.job_title}%`)
    .not("salary_min", "is", null)
    .not("salary_max", "is", null)
    .eq("is_active", true);

  if (input.location) {
    jobQuery = jobQuery.ilike("location", `%${input.location}%`);
  }

  const { data: jobSalaryRows } = await jobQuery.limit(30);

  const minList: number[] = [];
  const maxList: number[] = [];

  (salaryDataRows ?? []).forEach(r => {
    if (r.salary_range_min) minList.push(Number(r.salary_range_min));
    if (r.salary_range_max) maxList.push(Number(r.salary_range_max));
  });

  (jobSalaryRows ?? []).forEach(r => {
    if (r.salary_min) minList.push(Number(r.salary_min));
    if (r.salary_max) maxList.push(Number(r.salary_max));
  });

  if (minList.length === 0 && maxList.length === 0) {
    return {
      job_title: input.job_title,
      location: input.location || "All Regions",
      status: "INSUFFICIENT_DATA",
      message: "Insufficient verified compensation samples for this exact criteria.",
    };
  }

  minList.sort((a, b) => a - b);
  maxList.sort((a, b) => a - b);

  const medianMin = minList[Math.floor(minList.length / 2)] || 0;
  const medianMax = maxList[Math.floor(maxList.length / 2)] || medianMin;

  return {
    job_title: input.job_title,
    location: input.location || "India Benchmark",
    currency: "INR",
    percentiles: {
      p25: minList[Math.floor(minList.length * 0.25)] || medianMin,
      p50_median: Math.round((medianMin + medianMax) / 2),
      p75: maxList[Math.floor(maxList.length * 0.75)] || medianMax,
    },
    sample_size: minList.length,
    data_sources: ["TalentXcel Salary Registry", "Active Employer Postings"],
  };
}

// 16. career_coach
export const CareerCoachInput = z.object({
  question: z.string().trim().min(2).max(1000).describe("Career or recruitment query"),
  context: z.enum(["job_search", "salary_negotiation", "career_change", "skills", "resume", "interview", "general"]).default("general"),
});

export async function careerCoach(input: z.infer<typeof CareerCoachInput>, auth: AuthContext) {
  let profileContext = "";
  if (auth.isAuthenticated && auth.token && auth.userId) {
    const sb = createUserSupabase(auth.token);
    const { data: profile } = await sb.from("profiles").select("headline, experience_years, skills, location").eq("id", auth.userId).maybeSingle();
    if (profile) {
      profileContext = `Candidate: ${profile.headline || "Professional"} (${profile.experience_years || 0} yrs exp), Location: ${profile.location || "India"}, Skills: ${(profile.skills || []).slice(0, 6).join(", ")}`;
    }
  }

  const playbooks: Record<string, string[]> = {
    job_search: [
      "Prioritize applications where your skills overlap at least 70% with the requirements.",
      "Track your outreach pipeline and follow up on submitted applications after 5 business days.",
      "Leverage alumni and professional networks for direct referrals over cold form submissions.",
    ],
    salary_negotiation: [
      "Benchmark market rates using platform salary data before stating salary expectations.",
      "Anchor your counter-offer with concrete examples of past quantifiable business impact.",
      "Evaluate total CTC structure: base salary, performance variable, stock options, and benefits.",
    ],
    career_change: [
      "Highlight transferable competencies that directly de-risk the new role for hiring managers.",
      "Publish public proofs-of-work (code repositories, case studies, or design artifacts).",
      "Bridge credential gaps with recognized certifications in the target discipline.",
    ],
    skills: [
      "Focus development sprints on high-demand skills highlighted in live job postings.",
      "Pair theoretical learning with production-grade project implementations.",
      "Build depth in 2-3 complimentary core technologies rather than shallow surface across many.",
    ],
    resume: [
      "Tailor your headline and core competencies section to mirror target job description keywords.",
      "Every bullet point should follow: Action Verb + Context/Problem + Quantifiable Result.",
      "Keep formatting strictly ATS-parseable with standard typography and no decorative graphics.",
    ],
    interview: [
      "Structure behavioral responses using the STAR method (Situation, Task, Action, Result).",
      "Demonstrate thorough domain knowledge by articulating solutions to real challenges the company faces.",
      "Prepare 3 strategic questions for the interviewers about team priorities and engineering velocity.",
    ],
    general: [
      "Continuously maintain verified credentials on your TalentXcel Career Passport.",
      "Engage consistently in industry knowledge exchange and technical communities.",
    ],
  };

  return {
    query: input.question,
    context: input.context,
    candidate_profile_context: profileContext || "Public Context",
    strategic_guidance: playbooks[input.context] || playbooks.general,
  };
}
