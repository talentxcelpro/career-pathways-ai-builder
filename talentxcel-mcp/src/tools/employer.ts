// src/tools/employer.ts — Employer and Recruitment Intelligence tools (Group E)
// Verified DB tables: `companies`, `jobs`, `job_applications`

import { z } from "zod";
import { createUserSupabase, createPublicSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

// 17. search_employers
export const SearchEmployersInput = z.object({
  query: z.string().trim().min(1).max(100).optional().describe("Search term for employer / company name"),
  industry: z.string().trim().max(100).optional().describe("Industry domain filter (e.g. 'Technology', 'Finance')"),
  location: z.string().trim().max(100).optional().describe("Location filter"),
  limit: z.number().int().min(1).max(30).default(10),
  offset: z.number().int().min(0).default(0),
});

export async function searchEmployers(input: z.infer<typeof SearchEmployersInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  let q = sb
    .from("companies")
    .select("id, name, industry, location, website_url, size_range, is_verified, verification_status, description", { count: "exact" })
    .order("name", { ascending: true })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.query) {
    q = q.ilike("name", `%${input.query}%`);
  }
  if (input.industry) {
    q = q.ilike("industry", `%${input.industry}%`);
  }
  if (input.location) {
    q = q.ilike("location", `%${input.location}%`);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(`Employer search failed: ${error.message}`);

  return {
    total: count ?? data?.length ?? 0,
    offset: input.offset,
    limit: input.limit,
    employers: (data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      location: c.location,
      website: c.website_url,
      company_size: c.size_range,
      is_verified: c.is_verified || c.verification_status === "verified",
      description: c.description,
    })),
  };
}

// 18. get_employer_profile
export const GetEmployerProfileInput = z.object({
  employer_id: z.string().uuid().describe("UUID of the employer / company"),
});

export async function getEmployerProfile(input: z.infer<typeof GetEmployerProfileInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  const [compRes, jobsRes] = await Promise.all([
    sb.from("companies").select("*").eq("id", input.employer_id).maybeSingle(),
    sb.from("jobs").select("id, title, location, employment_type, salary_range, created_at").eq("company_id", input.employer_id).eq("is_active", true).limit(10),
  ]);

  if (compRes.error) throw new Error(`Failed to fetch employer profile: ${compRes.error.message}`);
  if (!compRes.data) throw new Error(`Employer not found: ${input.employer_id}`);

  const c = compRes.data;
  return {
    employer: {
      id: c.id,
      name: c.name,
      industry: c.industry,
      location: c.location,
      website: c.website_url,
      size_range: c.size_range,
      founded_year: c.founded_year,
      is_verified: c.is_verified,
      description: c.description,
      active_job_openings_count: jobsRes.data?.length ?? 0,
      active_jobs: jobsRes.data ?? [],
    },
  };
}

// 19. recruitment_insights
export const RecruitmentInsightsInput = z.object({
  industry: z.string().trim().max(100).optional().describe("Industry domain for market analytics"),
});

export async function recruitmentInsights(input: z.infer<typeof RecruitmentInsightsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();

  let jobsQ = sb.from("jobs").select("id, industry, employment_type, location, is_remote, views_count, applications_count").eq("is_active", true);
  if (input.industry) {
    jobsQ = jobsQ.ilike("industry", `%${input.industry}%`);
  }

  const { data: jobs, error } = await jobsQ.limit(100);
  if (error) throw new Error(`Failed to compile recruitment analytics: ${error.message}`);

  const totalOpenings = jobs?.length ?? 0;
  let remoteCount = 0;
  let totalApplications = 0;
  let totalViews = 0;
  const locationDist = new Map<string, number>();

  (jobs ?? []).forEach((j: Record<string, unknown>) => {
    if (j.is_remote) remoteCount++;
    if (typeof j.applications_count === "number") totalApplications += j.applications_count;
    if (typeof j.views_count === "number") totalViews += j.views_count;
    const loc = String(j.location || "Unspecified").split(",")[0].trim();
    locationDist.set(loc, (locationDist.get(loc) || 0) + 1);
  });

  return {
    industry: input.industry || "All Active Sectors",
    metrics: {
      active_vacancies_analyzed: totalOpenings,
      remote_work_share_percentage: totalOpenings > 0 ? Math.round((remoteCount / totalOpenings) * 100) : 0,
      total_applicant_interactions: totalApplications,
      total_vacancy_impressions: totalViews,
      top_hiring_locations: Array.from(locationDist.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([loc, count]) => ({ location: loc, jobs_count: count })),
    },
    hiring_velocity: totalApplications > 50 ? "ACCELERATED" : "STEADY",
  };
}

// 20. candidate_job_pipeline
export const CandidateJobPipelineInput = z.object({
  job_id: z.string().uuid().optional().describe("Filter pipeline by specific Job UUID"),
  status: z.enum(["applied", "screening", "interviewing", "offered", "rejected"]).optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export async function candidateJobPipeline(input: z.infer<typeof CandidateJobPipelineInput>, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token) {
    throw new Error("Authentication required: Only authenticated employers can access applicant pipelines.");
  }

  const sb = createUserSupabase(auth.token);

  let q = sb
    .from("job_applications")
    .select("id, job_id, job_title, full_name, status, applied_at, ctc_expected, notice_period, reviewed_at")
    .order("applied_at", { ascending: false })
    .limit(input.limit);

  if (input.job_id) {
    q = q.eq("job_id", input.job_id);
  }
  if (input.status) {
    q = q.eq("status", input.status);
  }

  const { data, error } = await q;
  if (error) {
    // If user has no permission or table has RLS filtering
    return {
      pipeline: [],
      note: "No authorized applications found in pipeline. Ensure your employer profile is connected to active job listings.",
    };
  }

  return {
    pipeline_count: data?.length ?? 0,
    applications: (data ?? []).map((a: Record<string, unknown>) => ({
      application_id: a.id,
      job_id: a.job_id,
      job_title: a.job_title,
      candidate_name: a.full_name,
      stage: a.status,
      expected_compensation: a.ctc_expected,
      notice_period: a.notice_period,
      applied_at: a.applied_at,
    })),
  };
}
