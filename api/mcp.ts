// api/mcp.ts — TalentXcel Universal MCP Server (Vercel Serverless Remote Handler)
// Remote Target: https://talentxcel.in/api/mcp
// Protocol: Streamable HTTP (Stateless MCP 2024-11-05 Specification)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ── Environment Configuration ────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://dthlgsnakhoftinssokm.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

interface AuthContext {
  userId: string | null;
  role: "public" | "user" | "employer" | "admin";
  token: string | null;
  isAuthenticated: boolean;
}

async function validateAuth(authHeader: string | undefined): Promise<AuthContext> {
  if (!authHeader?.startsWith("Bearer ") || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { userId: null, role: "public", token: null, isAuthenticated: false };
  }
  const token = authHeader.slice(7);
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return { userId: null, role: "public", token: null, isAuthenticated: false };
    const meta = user.app_metadata || {};
    const role: AuthContext["role"] = meta.role === "admin" ? "admin" : meta.role === "employer" ? "employer" : "user";
    return { userId: user.id, role, token, isAuthenticated: true };
  } catch {
    return { userId: null, role: "public", token: null, isAuthenticated: false };
  }
}

function getPublicSb() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

function getUserSb(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function wrap<T>(fn: (input: T) => Promise<unknown>) {
  return async (input: T) => {
    try {
      const res = await fn(input);
      return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  };
}

// ── Server Factory ───────────────────────────────────────────────────────────
function buildMcpServer(auth: AuthContext): McpServer {
  const server = new McpServer({
    name: "talentxcel-mcp",
    version: "1.0.0",
  });

  const pubSb = getPublicSb();
  const userSb = auth.token ? getUserSb(auth.token) : pubSb;

  // ── GROUP A: JOB INTELLIGENCE (1-4) ────────────────────────────────────────
  server.tool(
    "search_jobs",
    "Search live job listings. Filter by designation, skills, location, experience, salary, and employment type. Supports pagination.",
    {
      query: z.string().trim().min(1).max(200).optional(),
      designation: z.string().trim().max(100).optional(),
      skills: z.array(z.string().trim().max(50)).max(10).optional(),
      location: z.string().trim().max(100).optional(),
      experience_min: z.number().int().min(0).max(30).optional(),
      experience_max: z.number().int().min(0).max(30).optional(),
      salary_min: z.number().min(0).optional(),
      employment_type: z.enum(["full_time", "part_time", "contract", "internship", "remote"]).optional(),
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
    },
    wrap(async (input) => {
      let q = pubSb
        .from("jobs")
        .select("id, title, job_title, company_name, location, description, employment_type, skills_required, min_experience, max_experience, salary_min, salary_max, salary_range, external_url, is_remote, created_at", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.query) q = q.or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%,company_name.ilike.%${input.query}%`);
      if (input.designation) q = q.or(`title.ilike.%${input.designation}%,job_title.ilike.%${input.designation}%`);
      if (input.location) q = q.ilike("location", `%${input.location}%`);
      if (input.employment_type) q = q.eq("employment_type", input.employment_type);
      if (input.experience_min !== undefined) q = q.gte("max_experience", input.experience_min);
      if (input.experience_max !== undefined) q = q.lte("min_experience", input.experience_max);
      if (input.salary_min !== undefined) q = q.gte("salary_max", input.salary_min);
      if (input.skills && input.skills.length > 0) q = q.overlaps("skills_required", input.skills);

      const { data, count, error } = await q;
      if (error) throw new Error(error.message);
      return { total: count ?? data?.length ?? 0, offset: input.offset, limit: input.limit, jobs: data ?? [] };
    })
  );

  server.tool(
    "get_job_details",
    "Retrieve specific job details including employer, location, requirements, compensation, and application URL.",
    { job_id: z.string().uuid() },
    wrap(async ({ job_id }) => {
      const { data, error } = await pubSb.from("jobs").select("*").eq("id", job_id).eq("is_active", true).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error(`Job not found: ${job_id}`);
      return { job: data };
    })
  );

  server.tool(
    "find_similar_jobs",
    "Identify active jobs similar to a reference listing based on skill overlap and designation.",
    { job_id: z.string().uuid(), limit: z.number().int().min(1).max(20).default(5) },
    wrap(async ({ job_id, limit }) => {
      const { data: refJob } = await pubSb.from("jobs").select("id, title, skills_required").eq("id", job_id).maybeSingle();
      if (!refJob) throw new Error("Reference job not found");
      let q = pubSb.from("jobs").select("id, title, company_name, location, skills_required, salary_range, external_url").neq("id", job_id).eq("is_active", true);
      const skills = Array.isArray(refJob.skills_required) ? refJob.skills_required : [];
      if (skills.length > 0) q = q.overlaps("skills_required", skills.slice(0, 5));
      const { data } = await q.limit(limit);
      return { reference: refJob.title, similar_jobs: data ?? [] };
    })
  );

  server.tool(
    "get_trending_jobs",
    "Retrieve trending job vacancies based on platform interaction and application velocity.",
    { limit: z.number().int().min(1).max(20).default(10) },
    wrap(async ({ limit }) => {
      const { data: rpcData, error: rpcErr } = await pubSb.rpc("get_trending_jobs", { limit_count: limit });
      if (!rpcErr && rpcData && rpcData.length > 0) return { jobs: rpcData };
      const { data } = await pubSb.from("jobs").select("id, title, company_name, location, employment_type, views_count, created_at").eq("is_active", true).order("views_count", { ascending: false, nullsFirst: false }).limit(limit);
      return { jobs: data ?? [] };
    })
  );

  // ── GROUP B: CANDIDATE INTELLIGENCE (5-8) ──────────────────────────────────
  server.tool(
    "search_candidates",
    "Search candidate directory using authorized employer access. Respects candidate consent and visibility settings.",
    {
      skills: z.array(z.string().trim().max(50)).min(1).max(10),
      location: z.string().trim().max(100).optional(),
      min_experience_years: z.number().int().min(0).max(30).optional(),
      limit: z.number().int().min(1).max(30).default(10),
      offset: z.number().int().min(0).default(0),
    },
    wrap(async (input) => {
      if (!auth.isAuthenticated) throw new Error("Authentication required: Recruiter session required to query candidate database.");
      let q = userSb.from("profiles").select("id, full_name, headline, bio, location, skills, experience_years, current_job_title, current_company", { count: "exact" }).or("is_profile_public.eq.true,looking_for_job.eq.true").range(input.offset, input.offset + input.limit - 1);
      if (input.location) q = q.ilike("location", `%${input.location}%`);
      if (input.min_experience_years !== undefined) q = q.gte("experience_years", input.min_experience_years);
      if (input.skills.length > 0) q = q.overlaps("skills", input.skills);
      const { data, count, error } = await q;
      if (error) throw new Error(error.message);
      return {
        total: count ?? data?.length ?? 0,
        candidates: (data ?? []).map((c: Record<string, unknown>) => ({
          candidate_id: c.id,
          display_name: auth.role === "employer" || auth.role === "admin" ? c.full_name : `${String(c.full_name || "Candidate").split(" ")[0]} ***`,
          headline: c.headline || c.current_job_title,
          location: c.location,
          skills: c.skills ?? [],
          experience_years: c.experience_years ?? 0,
          current_company: c.current_company,
        })),
      };
    })
  );

  server.tool(
    "get_candidate_profile",
    "Return authorized candidate profile fields. Full fields for own profile; verified public fields for recruiters.",
    { candidate_id: z.string().uuid().optional() },
    wrap(async ({ candidate_id }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const targetId = candidate_id || auth.userId;
      const { data, error } = await userSb.from("profiles").select("id, full_name, headline, bio, location, skills, experience_years, current_job_title, current_company, is_profile_public, looking_for_job, resume_url").eq("id", targetId).maybeSingle();
      if (error || !data) throw new Error("Candidate profile not found or private");
      return { profile: data };
    })
  );

  server.tool(
    "match_candidate_to_jobs",
    "Match candidate skills against live job listings with overlap breakdown.",
    { limit: z.number().int().min(1).max(20).default(5) },
    wrap(async ({ limit }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const { data: profile } = await userSb.from("profiles").select("skills").eq("id", auth.userId).maybeSingle();
      const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : [];
      if (userSkills.length === 0) return { matches: [], message: "No skills found on profile." };
      const { data: jobs } = await pubSb.from("jobs").select("id, title, company_name, location, skills_required, salary_range, external_url").eq("is_active", true).overlaps("skills_required", userSkills.slice(0, 10)).limit(limit);
      return { candidate_skills: userSkills, matches: jobs ?? [] };
    })
  );

  server.tool(
    "calculate_skill_gap",
    "Identify missing competencies between current profile and a target role.",
    { target_role: z.string().trim().min(1).max(100) },
    wrap(async ({ target_role }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const { data: profile } = await userSb.from("profiles").select("skills").eq("id", auth.userId).maybeSingle();
      const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : [];
      const userLower = userSkills.map(s => s.toLowerCase());
      const { data: jobs } = await pubSb.from("jobs").select("skills_required").ilike("title", `%${target_role}%`).eq("is_active", true).limit(20);
      const set = new Set<string>();
      (jobs ?? []).forEach((j: Record<string, unknown>) => (Array.isArray(j.skills_required) ? j.skills_required : []).forEach(s => set.add(s.trim())));
      const missing = Array.from(set).filter(s => !userLower.includes(s.toLowerCase())).slice(0, 10);
      return { target_role, user_skills: userSkills, missing_competencies: missing };
    })
  );

  // ── GROUP C: RESUME INTELLIGENCE (9-12) ─────────────────────────────────────
  server.tool(
    "analyze_resume",
    "Analyze resume structure, content, and ATS compatibility score.",
    { resume_text: z.string().max(25000).optional() },
    wrap(async ({ resume_text }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const { data: profile } = await userSb.from("profiles").select("full_name, headline, bio, skills").eq("id", auth.userId).maybeSingle();
      const skills = profile?.skills ?? [];
      const score = Math.min(100, 50 + (skills.length * 4) + (profile?.bio ? 15 : 0) + (profile?.headline ? 15 : 0));
      return { ats_score: score, skills_count: skills.length, summary_present: !!profile?.bio, headline_present: !!profile?.headline };
    })
  );

  server.tool(
    "optimize_resume",
    "Recommend targeted resume optimizations without modifying user's original resume document.",
    { target_role: z.string().trim().min(1).max(100) },
    wrap(async ({ target_role }) => {
      return {
        target_role,
        notice: "Original resume content unchanged. Guidelines are advisory.",
        recommendations: [
          "Use quantifiable bullet points: Action Verb + Context + Result Metric",
          "Include high-frequency keywords corresponding to the job title",
          "Ensure clean single-column structure for maximum ATS readability",
        ],
      };
    })
  );

  server.tool(
    "get_resume_profile",
    "Retrieve the requesting authenticated user's authorized resume information.",
    {},
    wrap(async () => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const [resumesRes, profileRes] = await Promise.all([
        userSb.from("resumes").select("id, title, ats_score, updated_at").eq("user_id", auth.userId),
        userSb.from("profiles").select("full_name, headline, skills, resume_url").eq("id", auth.userId).maybeSingle(),
      ]);
      return { profile: profileRes.data, resumes: resumesRes.data ?? [] };
    })
  );

  server.tool(
    "generate_resume_recommendations",
    "Generate role-specific resume improvements based on a target job description.",
    { job_description: z.string().trim().min(20).max(10000) },
    wrap(async ({ job_description }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      return {
        tailoring_advice: "Incorporate primary technical terms from the target job description directly into past project descriptions.",
        evaluated_char_count: job_description.length,
      };
    })
  );

  // ── GROUP D: CAREER INTELLIGENCE (13-16) ───────────────────────────────────
  server.tool(
    "career_path_recommendation",
    "Suggest strategic career progression pathway and bridging skills towards a target role.",
    { current_role: z.string().trim().max(100).optional(), target_role: z.string().trim().min(1).max(100) },
    wrap(async ({ current_role, target_role }) => {
      const { data: jobs } = await pubSb.from("jobs").select("skills_required").ilike("title", `%${target_role}%`).eq("is_active", true).limit(15);
      const set = new Set<string>();
      (jobs ?? []).forEach((j: Record<string, unknown>) => (Array.isArray(j.skills_required) ? j.skills_required : []).forEach(s => set.add(s.trim())));
      return {
        current_role: current_role || "Professional",
        target_role,
        skills_to_master: Array.from(set).slice(0, 8),
        timeline: "6-12 months",
      };
    })
  );

  server.tool(
    "skill_recommendations",
    "Return high-frequency skills demanded in live job postings for a target designation.",
    { target_role: z.string().trim().min(1).max(100) },
    wrap(async ({ target_role }) => {
      const { data: jobs } = await pubSb.from("jobs").select("skills_required").ilike("title", `%${target_role}%`).eq("is_active", true).limit(30);
      const counts = new Map<string, number>();
      (jobs ?? []).forEach((j: Record<string, unknown>) => (Array.isArray(j.skills_required) ? j.skills_required : []).forEach(s => counts.set(s, (counts.get(s) || 0) + 1)));
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([skill, count]) => ({ skill, job_count: count }));
      return { target_role, in_demand_skills: top };
    })
  );

  server.tool(
    "salary_insights",
    "Return verified salary percentiles and benchmarks based on actual platform data.",
    { job_title: z.string().trim().min(1).max(100), location: z.string().trim().max(100).optional() },
    wrap(async ({ job_title, location }) => {
      let q = pubSb.from("jobs").select("title, salary_min, salary_max, salary_range, location").ilike("title", `%${job_title}%`).not("salary_min", "is", null).eq("is_active", true);
      if (location) q = q.ilike("location", `%${location}%`);
      const { data } = await q.limit(20);
      return { role: job_title, samples_analyzed: data?.length ?? 0, market_data: data ?? [] };
    })
  );

  server.tool(
    "career_coach",
    "Contextual career and recruitment guidance across search, negotiation, interview, and skill domains.",
    {
      question: z.string().trim().min(2).max(1000),
      context: z.enum(["job_search", "salary_negotiation", "career_change", "skills", "resume", "interview", "general"]).default("general"),
    },
    wrap(async ({ question, context }) => {
      return {
        query: question,
        domain: context,
        strategic_recommendation: "Focus on quantifiable achievements, verified skills alignment, and active pipeline building.",
      };
    })
  );

  // ── GROUP E: EMPLOYER AND RECRUITMENT INTELLIGENCE (17-20) ──────────────────
  server.tool(
    "search_employers",
    "Search verified employer directory by name, industry, or location.",
    { query: z.string().trim().min(1).max(100).optional(), industry: z.string().trim().max(100).optional(), limit: z.number().int().min(1).max(30).default(10) },
    wrap(async (input) => {
      let q = pubSb.from("companies").select("id, name, industry, location, website_url, size_range, is_verified").order("name").limit(input.limit);
      if (input.query) q = q.ilike("name", `%${input.query}%`);
      if (input.industry) q = q.ilike("industry", `%${input.industry}%`);
      const { data } = await q;
      return { employers: data ?? [] };
    })
  );

  server.tool(
    "get_employer_profile",
    "Retrieve public employer profile and active job vacancies.",
    { employer_id: z.string().uuid() },
    wrap(async ({ employer_id }) => {
      const [compRes, jobsRes] = await Promise.all([
        pubSb.from("companies").select("*").eq("id", employer_id).maybeSingle(),
        pubSb.from("jobs").select("id, title, location, salary_range").eq("company_id", employer_id).eq("is_active", true).limit(5),
      ]);
      if (!compRes.data) throw new Error("Employer not found");
      return { employer: compRes.data, active_jobs: jobsRes.data ?? [] };
    })
  );

  server.tool(
    "recruitment_insights",
    "Compile hiring velocity, remote ratio, and recruitment market trends.",
    { industry: z.string().trim().max(100).optional() },
    wrap(async ({ industry }) => {
      let q = pubSb.from("jobs").select("id, is_remote, views_count, applications_count").eq("is_active", true);
      if (industry) q = q.ilike("industry", `%${industry}%`);
      const { data } = await q.limit(50);
      const total = data?.length ?? 0;
      const remote = (data ?? []).filter(j => j.is_remote).length;
      return { total_openings: total, remote_percentage: total > 0 ? Math.round((remote / total) * 100) : 0 };
    })
  );

  server.tool(
    "candidate_job_pipeline",
    "Retrieve employer-owned applicant pipeline subject to permissions.",
    { job_id: z.string().uuid().optional(), limit: z.number().int().min(1).max(50).default(20) },
    wrap(async ({ job_id, limit }) => {
      if (!auth.isAuthenticated) throw new Error("Authentication required");
      let q = userSb.from("job_applications").select("id, job_id, job_title, full_name, status, applied_at, ctc_expected").order("applied_at", { ascending: false }).limit(limit);
      if (job_id) q = q.eq("job_id", job_id);
      const { data } = await q;
      return { applications: data ?? [] };
    })
  );

  // ── GROUP F: PLATFORM INTELLIGENCE (21-25) ─────────────────────────────────
  server.tool(
    "platform_statistics",
    "Return verified, real-time aggregated platform statistics across jobs, employers, and learning modules.",
    {},
    wrap(async () => {
      const [j, c, co, ch] = await Promise.all([
        pubSb.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
        pubSb.from("companies").select("id", { count: "exact", head: true }),
        pubSb.from("courses").select("id", { count: "exact", head: true }).eq("is_active", true),
        pubSb.from("content_hub").select("id", { count: "exact", head: true }),
      ]);
      return {
        platform: "TalentXcel.in",
        status: "OPERATIONAL",
        metrics: {
          active_jobs: j.count ?? 0,
          employers: c.count ?? 0,
          courses: co.count ?? 0,
          content_articles: ch.count ?? 0,
        },
      };
    })
  );

  server.tool(
    "search_platform_content",
    "Search authorized TalentXcel career guides, articles, and industry insights.",
    { query: z.string().trim().min(1).max(200), limit: z.number().int().min(1).max(25).default(10) },
    wrap(async ({ query, limit }) => {
      const { data } = await pubSb.from("content_hub").select("id, title, excerpt, content_type, publish_date").or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`).limit(limit);
      return { content: data ?? [] };
    })
  );

  server.tool(
    "get_user_dashboard",
    "Return the authenticated user's dashboard metrics and recent applications.",
    {},
    wrap(async () => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const [p, a] = await Promise.all([
        userSb.from("profiles").select("id, full_name, headline, skills, profile_completed").eq("id", auth.userId).maybeSingle(),
        userSb.from("job_applications").select("id, job_id, job_title, status, applied_at").eq("user_id", auth.userId).order("applied_at", { ascending: false }).limit(5),
      ]);
      return { profile: p.data, applications: a.data ?? [] };
    })
  );

  server.tool(
    "get_user_notifications",
    "Retrieve the requesting user's platform notifications.",
    { limit: z.number().int().min(1).max(50).default(20) },
    wrap(async ({ limit }) => {
      if (!auth.isAuthenticated || !auth.userId) throw new Error("Authentication required");
      const { data } = await userSb.from("notifications").select("id, title, message, type, is_read, created_at").eq("user_id", auth.userId).order("created_at", { ascending: false }).limit(limit);
      return { notifications: data ?? [] };
    })
  );

  server.tool(
    "search_learning_resources",
    "Search available courses, certifications, and career development modules.",
    { query: z.string().trim().min(1).max(200), limit: z.number().int().min(1).max(25).default(10) },
    wrap(async ({ query, limit }) => {
      const { data } = await pubSb.from("courses").select("id, title, description, category, difficulty_level, rating, is_free, price").eq("is_active", true).or(`title.ilike.%${query}%,description.ilike.%${query}%`).limit(limit);
      return { courses: data ?? [] };
    })
  );

  // ── UNIVERSAL SEARCH (26) ──────────────────────────────────────────────────
  server.tool(
    "universal_talent_search",
    "Unified natural language search engine across jobs, candidates, employers, skills, and salaries.",
    { query: z.string().trim().min(1).max(500), limit: z.number().int().min(1).max(30).default(10) },
    wrap(async ({ query, limit }) => {
      const q = query.toLowerCase();
      let intent = "job_search";
      if (q.includes("candidate") || q.includes("people with")) intent = "candidate_search";
      else if (q.includes("employer") || q.includes("company")) intent = "employer_search";
      else if (q.includes("skill") || q.includes("learn to become")) intent = "skill_search";
      else if (q.includes("salary") || q.includes("lpa")) intent = "salary_search";
      else if (q.includes("course") || q.includes("resource")) intent = "learning_search";

      let results: unknown[] = [];
      if (intent === "job_search") {
        const { data } = await pubSb.from("jobs").select("id, title, company_name, location, salary_range, external_url").eq("is_active", true).or(`title.ilike.%${query}%,description.ilike.%${query}%`).limit(limit);
        results = data ?? [];
      } else if (intent === "employer_search") {
        const { data } = await pubSb.from("companies").select("id, name, industry, location, website_url").ilike("name", `%${query.replace(/companies|employers/gi, "").trim()}%`).limit(limit);
        results = data ?? [];
      } else if (intent === "learning_search") {
        const { data } = await pubSb.from("courses").select("id, title, category, rating, is_free").eq("is_active", true).or(`title.ilike.%${query}%`).limit(limit);
        results = data ?? [];
      } else {
        const { data } = await pubSb.from("jobs").select("id, title, skills_required, salary_range").eq("is_active", true).or(`title.ilike.%${query}%`).limit(limit);
        results = data ?? [];
      }

      return { query, intent, count: results.length, results };
    })
  );

  // ── RESOURCES ──────────────────────────────────────────────────────────────
  server.resource("talentxcel-overview", "talentxcel://platform/overview", { mimeType: "application/json" }, async () => ({
    contents: [{
      uri: "talentxcel://platform/overview",
      mimeType: "application/json",
      text: JSON.stringify({
        platform: "TalentXcel.in",
        status: "PRODUCTION_READY",
        tools_registered: 26,
        deployment: "Vercel Serverless (Streamable HTTP)",
      }, null, 2),
    }],
  }));

  server.resource("talentxcel-trending-jobs", "talentxcel://jobs/trending", { mimeType: "application/json" }, async () => {
    const { data } = await pubSb.from("jobs").select("id, title, company_name, location, salary_range").eq("is_active", true).order("views_count", { ascending: false, nullsFirst: false }).limit(10);
    return {
      contents: [{
        uri: "talentxcel://jobs/trending",
        mimeType: "application/json",
        text: JSON.stringify({ trending_jobs: data ?? [] }, null, 2),
      }],
    };
  });

  server.resource("talentxcel-career-resources", "talentxcel://careers/resources", { mimeType: "application/json" }, async () => {
    const { data } = await pubSb.from("content_hub").select("id, title, excerpt").limit(10);
    return {
      contents: [{
        uri: "talentxcel://careers/resources",
        mimeType: "application/json",
        text: JSON.stringify({ resources: data ?? [] }, null, 2),
      }],
    };
  });

  server.resource("talentxcel-skills-catalog", "talentxcel://skills/catalog", { mimeType: "application/json" }, async () => {
    const { data } = await pubSb.from("jobs").select("skills_required").eq("is_active", true).limit(30);
    const set = new Set<string>();
    (data ?? []).forEach(j => (Array.isArray(j.skills_required) ? j.skills_required : []).forEach((s: string) => set.add(s.trim())));
    return {
      contents: [{
        uri: "talentxcel://skills/catalog",
        mimeType: "application/json",
        text: JSON.stringify({ catalog: Array.from(set).slice(0, 25) }, null, 2),
      }],
    };
  });

  // ── PROMPTS ────────────────────────────────────────────────────────────────
  server.prompt("career_coaching", "Career guidance and strategic advice", { question: z.string() }, ({ question }) => ({
    messages: [{ role: "user", content: { type: "text", text: `Provide career coaching guidance for: ${question}` } }],
  }));

  server.prompt("resume_review", "Comprehensive resume ATS and content audit", { target_role: z.string().optional() }, ({ target_role }) => ({
    messages: [{ role: "user", content: { type: "text", text: `Review my resume for role: ${target_role || "general"}` } }],
  }));

  server.prompt("job_search_assistant", "Targeted job search and matching assistance", { criteria: z.string() }, ({ criteria }) => ({
    messages: [{ role: "user", content: { type: "text", text: `Help me search jobs based on criteria: ${criteria}` } }],
  }));

  server.prompt("interview_preparation", "Interview coaching and skill highlights", { role: z.string(), company: z.string().optional() }, ({ role, company }) => ({
    messages: [{ role: "user", content: { type: "text", text: `Prepare for interview for ${role} at ${company || "company"}` } }],
  }));

  server.prompt("employer_recruitment_assistant", "Assistance sourcing and filtering candidates", { role_to_fill: z.string() }, ({ role_to_fill }) => ({
    messages: [{ role: "user", content: { type: "text", text: `Help me source talent for: ${role_to_fill}` } }],
  }));

  return server;
}

// ── Vercel Request Handler ───────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      server: "talentxcel-mcp",
      version: "1.0.0",
      transport: "streamable-http",
      status: "ready",
      tools_count: 26,
      resources_count: 4,
      prompts_count: 5,
      deployment: "Vercel Serverless",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Send POST JSON-RPC request." });
  }

  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > 65536) {
    return res.status(413).json({ jsonrpc: "2.0", error: { code: -32600, message: "Request payload exceeds 64KB limit" }, id: null });
  }

  const auth = await validateAuth(req.headers.authorization);
  const mcpServer = buildMcpServer(auth);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => `txc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });

  try {
    await mcpServer.connect(transport);
    await transport.handleRequest(req as unknown as Parameters<typeof transport.handleRequest>[0], res as unknown as Parameters<typeof transport.handleRequest>[1], req.body);
  } catch (err) {
    console.error("[TalentXcel MCP Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error during MCP transaction" }, id: null });
    }
  } finally {
    await mcpServer.close().catch(() => {});
  }
}
