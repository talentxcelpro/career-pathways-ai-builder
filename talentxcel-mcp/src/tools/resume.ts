// src/tools/resume.ts — Resume Intelligence tools (Group C)
// Verified DB tables: `resumes`, `resume_ats_analysis`, `profiles`

import { z } from "zod";
import { createUserSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

// 9. analyze_resume
export const AnalyzeResumeInput = z.object({
  target_job_title: z.string().trim().max(100).optional().describe("Optional target job title to evaluate resume against"),
  resume_text: z.string().max(25000).optional().describe("Optional raw resume text to analyze directly"),
});

export async function analyzeResume(input: z.infer<typeof AnalyzeResumeInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required to analyze resume.");
  }

  const sb = createUserSupabase(auth.token);

  // Retrieve user's primary resume or profile
  const [resumeRes, profileRes] = await Promise.all([
    sb.from("resumes").select("id, title, content, ats_score, updated_at").eq("user_id", auth.userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    sb.from("profiles").select("full_name, headline, bio, skills, experience_years").eq("id", auth.userId).maybeSingle(),
  ]);

  const profile = profileRes.data;
  const resume = resumeRes.data;

  const contentToAnalyze = input.resume_text || (resume?.content ? (typeof resume.content === "string" ? resume.content : JSON.stringify(resume.content)) : `${profile?.headline || ""} ${profile?.bio || ""} ${(profile?.skills || []).join(" ")}`);

  const issues: string[] = [];
  const strengths: string[] = [];

  if (!profile?.headline) issues.push("Missing concise professional headline");
  else strengths.push("Strong professional headline present");

  if (!profile?.bio || profile.bio.length < 60) issues.push("Professional summary is too brief or missing impact metrics");
  else strengths.push("Clear executive summary present");

  const skillCount = profile?.skills?.length ?? 0;
  if (skillCount < 6) issues.push(`Only ${skillCount} skills identified — recommend 10-15 industry standard competencies`);
  else strengths.push(`Comprehensive skill taxonomy (${skillCount} verified skills)`);

  const hasMetrics = /\b\d+(?:%|k|\+|x|\s*lpa|\s*crore|\s*million|\s*cr)\b/i.test(contentToAnalyze);
  if (!hasMetrics) issues.push("Lack of quantified outcomes (percentages, revenue, performance improvements, team sizes)");
  else strengths.push("Includes quantifiable impact indicators");

  const atsScore = Math.min(100, Math.max(30, 100 - (issues.length * 15)));

  return {
    ats_compatibility_score: resume?.ats_score || atsScore,
    status: atsScore >= 80 ? "STRONG" : atsScore >= 60 ? "NEEDS_OPTIMIZATION" : "SUBSTANTIAL_GAPS",
    strengths,
    flagged_issues: issues,
    recommendations: issues.map(issue => `Improvement: ${issue}`),
    target_role_evaluated: input.target_job_title || profile?.headline || "General Industry Benchmark",
  };
}

// 10. optimize_resume
export const OptimizeResumeInput = z.object({
  target_role: z.string().trim().min(1).max(100).describe("Role for which to generate optimization guidelines"),
});

export async function optimizeResume(input: z.infer<typeof OptimizeResumeInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required to generate resume optimizations.");
  }

  const sb = createUserSupabase(auth.token);
  const { data: profile } = await sb
    .from("profiles")
    .select("skills, headline, bio, experience_years")
    .eq("id", auth.userId)
    .maybeSingle();

  const currentSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : [];

  return {
    target_role: input.target_role,
    non_destructive_notice: "Original resume content remains intact. Recommendations are advisory.",
    bullet_point_formula: "Accomplished [X] as measured by [Y], by doing [Z]. Example: 'Engineered high-throughput event pipeline reducing latency by 42% across 2M daily queries.'",
    action_verbs_recommended: ["Architected", "Spearheaded", "Streamlined", "Accelerated", "Automated", "Delivered", "Transformed", "Optimized"],
    format_recommendations: [
      "Use single-column ATS-friendly layout without tables or text boxes",
      "Ensure standard section headings: Professional Summary, Core Competencies, Experience, Education",
      "Format dates consistently as MM/YYYY - MM/YYYY",
    ],
    tailored_headline_suggestion: `${input.target_role} | ${currentSkills.slice(0, 4).join(" · ")}`,
  };
}

// 11. get_resume_profile
export const GetResumeProfileInput = z.object({});

export async function getResumeProfile(_input: z.infer<typeof GetResumeProfileInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required to retrieve resume profile.");
  }

  const sb = createUserSupabase(auth.token);
  const [resumesRes, profileRes] = await Promise.all([
    sb.from("resumes").select("id, title, ats_score, is_primary, is_public, created_at, updated_at").eq("user_id", auth.userId),
    sb.from("profiles").select("full_name, headline, bio, location, skills, experience_years, current_job_title, current_company, resume_url").eq("id", auth.userId).maybeSingle(),
  ]);

  return {
    user_id: auth.userId,
    profile_summary: profileRes.data,
    saved_resumes: resumesRes.data ?? [],
    active_resume_url: profileRes.data?.resume_url || null,
  };
}

// 12. generate_resume_recommendations
export const GenerateResumeRecommendationsInput = z.object({
  job_description: z.string().trim().min(20).max(10000).describe("Full text of target job description to match against"),
});

export async function generateResumeRecommendations(input: z.infer<typeof GenerateResumeRecommendationsInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token || !auth.userId) {
    throw new Error("Authentication required for role-specific resume recommendations.");
  }

  const sb = createUserSupabase(auth.token);
  const { data: profile } = await sb.from("profiles").select("skills, headline, bio").eq("id", auth.userId).maybeSingle();

  const userSkills = ((profile?.skills as string[]) || []).map((s: string) => s.toLowerCase());
  const words = input.job_description.toLowerCase().match(/\b[a-z]{3,20}\b/g) || [];

  // Extract notable technical/business terms from JD
  const freq = new Map<string, number>();
  words.forEach(w => {
    if (!["with", "from", "that", "this", "have", "will", "your", "must", "work", "team", "role"].includes(w)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  });

  const highPriorityJdTerms = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);

  const missingKeywords = highPriorityJdTerms.filter(term => !userSkills.some((s: string) => s.includes(term)));

  return {
    keyword_alignment_analysis: {
      high_priority_jd_terms: highPriorityJdTerms,
      recommended_keywords_to_integrate: missingKeywords,
    },
    tailoring_steps: [
      "Integrate high-frequency keywords organically into experience descriptions",
      "Align executive summary directly with the role title and primary mandate",
      "Emphasize past projects that solved problems closest to those in this job description",
    ],
  };
}
