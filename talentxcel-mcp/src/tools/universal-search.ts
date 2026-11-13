// src/tools/universal-search.ts — Universal Talent Search Engine (Phase 3)
// Routes natural language queries across verified data sources

import { z } from "zod";
import { createPublicSupabase, createUserSupabase } from "../auth.js";
import type { AuthContext } from "../auth.js";

export const UniversalSearchInput = z.object({
  query: z.string().trim().min(1).max(500).describe("Natural language query (e.g. 'Remote React jobs paying above 15 LPA', 'Find candidates with Java and AWS')"),
  limit: z.number().int().min(1).max(30).default(10),
  offset: z.number().int().min(0).default(0),
});

type SearchIntent = "job_search" | "candidate_search" | "employer_search" | "skill_intelligence" | "salary_inquiry" | "learning_resources";

interface ExtractedFilters {
  role?: string;
  location?: string;
  skills: string[];
  min_experience?: number;
  min_salary_lpa?: number;
  is_remote?: boolean;
}

function parseNaturalLanguageQuery(query: string): { intent: SearchIntent; confidence: number; filters: ExtractedFilters } {
  const q = query.toLowerCase();
  const filters: ExtractedFilters = { skills: [] };

  // Detect Intent
  let intent: SearchIntent = "job_search";
  let confidence = 0.85;

  if (q.includes("candidate") || q.includes("resume matching") || q.includes("matching my resume") || q.includes("people with") || q.includes("profiles")) {
    intent = "candidate_search";
    confidence = 0.92;
  } else if (q.includes("employer") || q.includes("companies recruiting") || q.includes("companies hiring")) {
    intent = "employer_search";
    confidence = 0.90;
  } else if (q.includes("what skill") || q.includes("skills should i") || q.includes("learn to become") || q.includes("how to become")) {
    intent = "skill_intelligence";
    confidence = 0.95;
  } else if (q.includes("salary") || q.includes("how much") || q.includes("average pay") || (q.includes("lpa") && !q.includes("job"))) {
    intent = "salary_inquiry";
    confidence = 0.88;
  } else if (q.includes("learning") || q.includes("course") || q.includes("career resource") || q.includes("fresh graduate") || q.includes("certif")) {
    intent = "learning_resources";
    confidence = 0.90;
  }

  // Extract Remote
  if (q.includes("remote") || q.includes("work from home") || q.includes("wfh")) {
    filters.is_remote = true;
  }

  // Extract Experience
  const expMatch = q.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:experience|exp)?/i);
  if (expMatch) {
    filters.min_experience = parseInt(expMatch[1], 10);
  }

  // Extract Salary LPA (e.g. "15 LPA", "₹15 LPA", "paying above 12")
  const lpaMatch = q.match(/(?:paying\s+above\s+|above\s+|min\s+|₹)?(\d+)\s*(?:lpa|lakhs?)/i);
  if (lpaMatch) {
    filters.min_salary_lpa = parseInt(lpaMatch[1], 10) * 100000;
  }

  // Extract Common Tech Skills
  const knownSkills = [
    "python", "react", "node", "typescript", "javascript", "java", "aws", "docker",
    "kubernetes", "sql", "postgresql", "fastapi", "django", "golang", "c++", "c#",
    ".net", "flutter", "devops", "machine learning", "ai", "data engineer", "figma"
  ];

  for (const s of knownSkills) {
    const regex = new RegExp(`\\b${s}\\b`, "i");
    if (regex.test(q)) {
      filters.skills.push(s);
    }
  }

  // Extract Location (e.g. "in Bangalore", "in Mumbai", "in Delhi", "in Pune", "in Hyderabad")
  const locMatch = q.match(/\bin\s+([A-Za-z\s]+?)(?:\s+paying|\s+with|\s+having|\s+above|$)/i);
  if (locMatch) {
    filters.location = locMatch[1].trim();
  }

  return { intent, confidence, filters };
}

export async function universalTalentSearch(input: z.infer<typeof UniversalSearchInput>, auth: AuthContext) {
  const { intent, confidence, filters } = parseNaturalLanguageQuery(input.query);
  const sb = createPublicSupabase();

  let results: unknown[] = [];
  let sourceAttribution = "";
  let totalCount = 0;

  switch (intent) {
    case "job_search": {
      sourceAttribution = "talentxcel://jobs/live";
      let q = sb
        .from("jobs")
        .select("id, title, company_name, location, employment_type, skills_required, min_experience, max_experience, salary_range, salary_min, salary_max, external_url, is_remote, created_at", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (filters.is_remote) {
        q = q.eq("is_remote", true);
      }
      if (filters.location) {
        q = q.ilike("location", `%${filters.location}%`);
      }
      if (filters.min_salary_lpa) {
        q = q.gte("salary_max", filters.min_salary_lpa);
      }
      if (filters.min_experience !== undefined) {
        q = q.lte("min_experience", filters.min_experience);
      }
      if (filters.skills.length > 0) {
        q = q.overlaps("skills_required", filters.skills);
      } else {
        // Text keyword fallback
        q = q.or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%`);
      }

      const { data, count } = await q;
      totalCount = count ?? data?.length ?? 0;
      results = (data ?? []).map((j: Record<string, unknown>) => ({
        type: "job_listing",
        id: j.id,
        title: j.title,
        company: j.company_name,
        location: j.location,
        is_remote: j.is_remote,
        skills: j.skills_required,
        salary: j.salary_range,
        url: j.external_url,
      }));
      break;
    }

    case "candidate_search": {
      sourceAttribution = "talentxcel://candidates/public_profiles";
      if (!auth.isAuthenticated || !auth.token) {
        results = [{
          message: "Sign in with an employer or candidate account to inspect candidate matches.",
          action_required: "AUTHENTICATION",
        }];
        totalCount = 0;
        break;
      }

      const userSb = createUserSupabase(auth.token);
      let cq = userSb
        .from("profiles")
        .select("id, full_name, headline, location, skills, experience_years, current_company, current_job_title", { count: "exact" })
        .eq("is_profile_public", true)
        .range(input.offset, input.offset + input.limit - 1);

      if (filters.skills.length > 0) {
        cq = cq.overlaps("skills", filters.skills);
      }
      if (filters.min_experience !== undefined) {
        cq = cq.gte("experience_years", filters.min_experience);
      }
      if (filters.location) {
        cq = cq.ilike("location", `%${filters.location}%`);
      }

      const { data, count } = await cq;
      totalCount = count ?? data?.length ?? 0;
      results = (data ?? []).map((c: Record<string, unknown>) => ({
        type: "candidate_match",
        id: c.id,
        name: auth.role === "employer" || auth.role === "admin" ? c.full_name : `${String(c.full_name || "Candidate").split(" ")[0]} ***`,
        headline: c.headline || c.current_job_title,
        skills: c.skills,
        experience_years: c.experience_years,
        location: c.location,
      }));
      break;
    }

    case "employer_search": {
      sourceAttribution = "talentxcel://employers/directory";
      const cleanSearch = input.query.replace(/find|employers?|companies|recruiting|hiring/gi, "").trim();
      const { data, count } = await sb
        .from("companies")
        .select("id, name, industry, location, website_url, size_range, is_verified", { count: "exact" })
        .ilike("name", `%${cleanSearch || ""}%`)
        .range(input.offset, input.offset + input.limit - 1);

      totalCount = count ?? data?.length ?? 0;
      results = (data ?? []).map((c: Record<string, unknown>) => ({
        type: "employer",
        id: c.id,
        name: c.name,
        industry: c.industry,
        location: c.location,
        website: c.website_url,
        is_verified: c.is_verified,
      }));
      break;
    }

    case "skill_intelligence": {
      sourceAttribution = "talentxcel://skills/market_demand";
      const target = input.query.replace(/what skills? (?:should i learn|to become)|how to become/gi, "").trim();
      const { data } = await sb
        .from("jobs")
        .select("skills_required")
        .ilike("title", `%${target}%`)
        .eq("is_active", true)
        .limit(30);

      const freq = new Map<string, number>();
      (data ?? []).forEach((j: Record<string, unknown>) => {
        (Array.isArray(j.skills_required) ? (j.skills_required as string[]) : []).forEach(s => {
          freq.set(s, (freq.get(s) || 0) + 1);
        });
      });

      const topSkills = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s, c]) => ({ skill: s, market_frequency: c }));
      totalCount = topSkills.length;
      results = [{
        target_role: target,
        essential_competencies: topSkills,
      }];
      break;
    }

    case "salary_inquiry": {
      sourceAttribution = "talentxcel://salary/percentiles";
      const { data } = await sb
        .from("jobs")
        .select("title, salary_min, salary_max, salary_range, location")
        .not("salary_min", "is", null)
        .or(`title.ilike.%${input.query}%,job_title.ilike.%${input.query}%`)
        .limit(10);

      totalCount = data?.length ?? 0;
      results = (data ?? []).map((j: Record<string, unknown>) => ({
        type: "salary_benchmark",
        role: j.title,
        salary_range: j.salary_range,
        location: j.location,
      }));
      break;
    }

    case "learning_resources": {
      sourceAttribution = "talentxcel://learning/courses";
      const { data, count } = await sb
        .from("courses")
        .select("id, title, description, category, difficulty_level, instructor_name, is_free, price, rating", { count: "exact" })
        .eq("is_active", true)
        .or(`title.ilike.%${input.query}%,category.ilike.%${input.query}%`)
        .range(input.offset, input.offset + input.limit - 1);

      totalCount = count ?? data?.length ?? 0;
      results = (data ?? []).map((c: Record<string, unknown>) => ({
        type: "learning_course",
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty_level,
        is_free: c.is_free,
        price: c.price,
      }));
      break;
    }
  }

  return {
    query: input.query,
    intent,
    confidence_score: confidence,
    source_attribution: sourceAttribution,
    parsed_filters: filters,
    pagination: {
      total_matches: totalCount,
      offset: input.offset,
      limit: input.limit,
    },
    results,
  };
}
