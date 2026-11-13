// src/tools/jobs.ts — Job Intelligence tools (Group A)
// Verified DB table: `jobs`

import { z } from "zod";
import { createPublicSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

// 1. search_jobs
export const SearchJobsInput = z.object({
  query: z.string().trim().min(1).max(200).optional().describe("Keyword search across title, description, and company name"),
  designation: z.string().trim().max(100).optional().describe("Filter by job title/designation"),
  skills: z.array(z.string().trim().max(50)).max(10).optional().describe("Array of required skills"),
  location: z.string().trim().max(100).optional().describe("Location filter (city, state, or country)"),
  experience_min: z.number().int().min(0).max(30).optional().describe("Minimum years of experience"),
  experience_max: z.number().int().min(0).max(30).optional().describe("Maximum years of experience"),
  salary_min: z.number().min(0).optional().describe("Minimum annual salary / compensation"),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "remote"]).optional(),
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0),
});

export async function searchJobs(input: z.infer<typeof SearchJobsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  let q = sb
    .from("jobs")
    .select("id, title, job_title, company_name, location, description, employment_type, skills_required, min_experience, max_experience, salary_min, salary_max, salary_currency, salary_range, created_at, external_url, is_remote, is_active", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.query) {
    q = q.or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%,company_name.ilike.%${input.query}%`);
  }
  if (input.designation) {
    q = q.or(`title.ilike.%${input.designation}%,job_title.ilike.%${input.designation}%`);
  }
  if (input.location) {
    q = q.ilike("location", `%${input.location}%`);
  }
  if (input.employment_type) {
    q = q.eq("employment_type", input.employment_type);
  }
  if (input.experience_min !== undefined) {
    q = q.gte("max_experience", input.experience_min);
  }
  if (input.experience_max !== undefined) {
    q = q.lte("min_experience", input.experience_max);
  }
  if (input.salary_min !== undefined) {
    q = q.gte("salary_max", input.salary_min);
  }
  if (input.skills && input.skills.length > 0) {
    q = q.overlaps("skills_required", input.skills);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(`Job search failed: ${error.message}`);

  return {
    total: count ?? data?.length ?? 0,
    offset: input.offset,
    limit: input.limit,
    jobs: (data ?? []).map((j: Record<string, unknown>) => ({
      id: j.id,
      title: j.title || j.job_title,
      company: j.company_name,
      location: j.location,
      employment_type: j.employment_type,
      skills_required: j.skills_required,
      experience_range: [j.min_experience, j.max_experience],
      salary_range: j.salary_range || (j.salary_min && j.salary_max ? `${j.salary_currency || "INR"} ${j.salary_min} - ${j.salary_max}` : null),
      is_remote: j.is_remote,
      application_url: j.external_url,
      created_at: j.created_at,
    })),
  };
}

// 2. get_job_details
export const GetJobDetailsInput = z.object({
  job_id: z.string().uuid().describe("Unique UUID of the job listing"),
});

export async function getJobDetails(input: z.infer<typeof GetJobDetailsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  const { data, error } = await sb
    .from("jobs")
    .select("id, title, job_title, company_name, company_website, company_size, location, description, detailed_description, employment_type, skills_required, min_experience, max_experience, educational_qualification, education_requirements, requirements, must_have_requirements, nice_to_have, benefits, benefits_offered, salary_min, salary_max, salary_currency, salary_range, created_at, external_url, is_remote, is_urgent, is_featured, is_active")
    .eq("id", input.job_id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch job: ${error.message}`);
  if (!data) throw new Error(`Job not found or inactive: ${input.job_id}`);

  return {
    job: {
      id: data.id,
      title: data.title || data.job_title,
      company: {
        name: data.company_name,
        website: data.company_website,
        size: data.company_size,
      },
      location: data.location,
      employment_type: data.employment_type,
      description: data.detailed_description || data.description,
      skills_required: data.skills_required ?? [],
      requirements: {
        min_experience_years: data.min_experience,
        max_experience_years: data.max_experience,
        education: data.educational_qualification || data.education_requirements,
        must_have: data.must_have_requirements ?? [],
        nice_to_have: data.nice_to_have ?? [],
      },
      compensation: {
        min: data.salary_min,
        max: data.salary_max,
        currency: data.salary_currency || "INR",
        display: data.salary_range,
        benefits: data.benefits_offered || data.benefits || [],
      },
      is_remote: data.is_remote,
      is_featured: data.is_featured,
      is_urgent: data.is_urgent,
      application_url: data.external_url,
      posted_at: data.created_at,
    },
  };
}

// 3. find_similar_jobs
export const FindSimilarJobsInput = z.object({
  job_id: z.string().uuid().describe("UUID of the reference job"),
  limit: z.number().int().min(1).max(20).default(5),
});

export async function findSimilarJobs(input: z.infer<typeof FindSimilarJobsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();
  const { data: refJob, error: refError } = await sb
    .from("jobs")
    .select("id, title, skills_required, category, location, employment_type")
    .eq("id", input.job_id)
    .maybeSingle();

  if (refError || !refJob) {
    throw new Error(`Reference job not found: ${input.job_id}`);
  }

  let query = sb
    .from("jobs")
    .select("id, title, company_name, location, employment_type, skills_required, min_experience, max_experience, salary_range, external_url, created_at")
    .neq("id", input.job_id)
    .eq("is_active", true);

  const skills: string[] = Array.isArray(refJob.skills_required) ? refJob.skills_required : [];
  if (skills.length > 0) {
    query = query.overlaps("skills_required", skills.slice(0, 5));
  } else if (refJob.title) {
    query = query.ilike("title", `%${refJob.title.split(" ")[0]}%`);
  }

  const { data: similar, error } = await query.limit(input.limit);
  if (error) throw new Error(`Failed to find similar jobs: ${error.message}`);

  return {
    reference_job: { id: refJob.id, title: refJob.title },
    similar_jobs: (similar ?? []).map((j: Record<string, unknown>) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      location: j.location,
      employment_type: j.employment_type,
      skills: j.skills_required,
      salary: j.salary_range,
      application_url: j.external_url,
    })),
  };
}

// 4. get_trending_jobs
export const GetTrendingJobsInput = z.object({
  limit: z.number().int().min(1).max(20).default(10),
});

export async function getTrendingJobs(input: z.infer<typeof GetTrendingJobsInput>, _auth: AuthContext) {
  const sb = createPublicSupabase();

  // Try RPC `get_trending_jobs` first, fallback to sorted query
  const { data: rpcData, error: rpcError } = await sb
    .rpc("get_trending_jobs", { limit_count: input.limit });

  if (!rpcError && rpcData && rpcData.length > 0) {
    return {
      source: "trending_telemetry_rpc",
      jobs: rpcData,
    };
  }

  const { data, error } = await sb
    .from("jobs")
    .select("id, title, company_name, location, employment_type, trending_score, views_count, applications_count, created_at")
    .eq("is_active", true)
    .order("views_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(input.limit);

  if (error) throw new Error(`Failed to fetch trending jobs: ${error.message}`);

  return {
    source: "platform_views_telemetry",
    jobs: (data ?? []).map((j: Record<string, unknown>) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      location: j.location,
      employment_type: j.employment_type,
      views_count: j.views_count ?? 0,
      applications_count: j.applications_count ?? 0,
      trending_score: j.trending_score ?? 0,
      created_at: j.created_at,
    })),
  };
}
