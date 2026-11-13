// src/registry.ts — Full Production Tool, Resource, and Prompt Registry
// Implements all 26 tools across Groups A through F + Universal Search

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthContext } from "./auth.js";
import { createPublicSupabase } from "./auth.js";

// Group A: Job Intelligence (1-4)
import {
  SearchJobsInput, searchJobs,
  GetJobDetailsInput, getJobDetails,
  FindSimilarJobsInput, findSimilarJobs,
  GetTrendingJobsInput, getTrendingJobs
} from "./tools/jobs.js";

// Group B: Candidate Intelligence (5-8)
import {
  SearchCandidatesInput, searchCandidates,
  GetCandidateProfileInput, getCandidateProfile,
  MatchCandidateToJobsInput, matchCandidateToJobs,
  CalculateSkillGapInput, calculateSkillGap
} from "./tools/candidate.js";

// Group C: Resume Intelligence (9-12)
import {
  AnalyzeResumeInput, analyzeResume,
  OptimizeResumeInput, optimizeResume,
  GetResumeProfileInput, getResumeProfile,
  GenerateResumeRecommendationsInput, generateResumeRecommendations
} from "./tools/resume.js";

// Group D: Career Intelligence (13-16)
import {
  CareerPathInput, careerPathRecommendation,
  SkillRecommendationsInput, skillRecommendations,
  SalaryInsightsInput, salaryInsights,
  CareerCoachInput, careerCoach
} from "./tools/career.js";

// Group E: Employer Intelligence (17-20)
import {
  SearchEmployersInput, searchEmployers,
  GetEmployerProfileInput, getEmployerProfile,
  RecruitmentInsightsInput, recruitmentInsights,
  CandidateJobPipelineInput, candidateJobPipeline
} from "./tools/employer.js";

// Group F: Platform Intelligence (21-25)
import {
  PlatformStatisticsInput, platformStatistics,
  SearchPlatformContentInput, searchPlatformContent,
  GetUserDashboardInput, getUserDashboard,
  GetUserNotificationsInput, getUserNotifications,
  SearchLearningResourcesInput, searchLearningResources
} from "./tools/platform.js";

// Universal Search (26)
import {
  UniversalSearchInput, universalTalentSearch
} from "./tools/universal-search.js";

function wrap<T>(fn: (input: T, auth: AuthContext) => Promise<unknown>, getAuth: () => AuthContext) {
  return async (input: T) => {
    try {
      const result = await fn(input, getAuth());
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  };
}

export function registerAllTools(server: McpServer, getAuth: () => AuthContext): void {
  // ── GROUP A: JOB INTELLIGENCE ──────────────────────────────────────────
  server.tool("search_jobs", "Search live job listings with filters for designation, skills, location, experience, salary, and employment type. Supports pagination.", SearchJobsInput.shape, wrap(searchJobs, getAuth));
  server.tool("get_job_details", "Retrieve specific job details including employer, location, requirements, compensation, and application URL.", GetJobDetailsInput.shape, wrap(getJobDetails, getAuth));
  server.tool("find_similar_jobs", "Identify active jobs similar to a reference listing based on skill overlap and category.", FindSimilarJobsInput.shape, wrap(findSimilarJobs, getAuth));
  server.tool("get_trending_jobs", "Retrieve trending job vacancies based on platform interaction and application velocity.", GetTrendingJobsInput.shape, wrap(getTrendingJobs, getAuth));

  // ── GROUP B: CANDIDATE INTELLIGENCE ────────────────────────────────────
  server.tool("search_candidates", "Search candidate directory using authorized employer access. Respects candidate consent and visibility settings.", SearchCandidatesInput.shape, wrap(searchCandidates, getAuth));
  server.tool("get_candidate_profile", "Return authorized candidate profile fields. Full fields for own profile; verified public fields for recruiters.", GetCandidateProfileInput.shape, wrap(getCandidateProfile, getAuth));
  server.tool("match_candidate_to_jobs", "Match a candidate's skills against live job listings with skill overlap and missing skill breakdown.", MatchCandidateToJobsInput.shape, wrap(matchCandidateToJobs, getAuth));
  server.tool("calculate_skill_gap", "Identify missing competencies between current profile and a target role using market benchmarks.", CalculateSkillGapInput.shape, wrap(calculateSkillGap, getAuth));

  // ── GROUP C: RESUME INTELLIGENCE ───────────────────────────────────────
  server.tool("analyze_resume", "Analyze resume structure, content, and ATS compatibility score with actionable recommendations.", AnalyzeResumeInput.shape, wrap(analyzeResume, getAuth));
  server.tool("optimize_resume", "Recommend targeted resume optimizations without modifying user's original resume document.", OptimizeResumeInput.shape, wrap(optimizeResume, getAuth));
  server.tool("get_resume_profile", "Retrieve the requesting authenticated user's authorized resume and profile information.", GetResumeProfileInput.shape, wrap(getResumeProfile, getAuth));
  server.tool("generate_resume_recommendations", "Generate role-specific resume improvements based on a target job description.", GenerateResumeRecommendationsInput.shape, wrap(generateResumeRecommendations, getAuth));

  // ── GROUP D: CAREER INTELLIGENCE ───────────────────────────────────────
  server.tool("career_path_recommendation", "Suggest strategic career progression pathway and bridging skills towards a target role.", CareerPathInput.shape, wrap(careerPathRecommendation, getAuth));
  server.tool("skill_recommendations", "Return high-frequency skills demanded in live job postings for a target designation.", SkillRecommendationsInput.shape, wrap(skillRecommendations, getAuth));
  server.tool("salary_insights", "Return verified salary percentiles and benchmarks based on actual platform data.", SalaryInsightsInput.shape, wrap(salaryInsights, getAuth));
  server.tool("career_coach", "Contextual career and recruitment guidance across search, negotiation, interview, and skill domains.", CareerCoachInput.shape, wrap(careerCoach, getAuth));

  // ── GROUP E: EMPLOYER AND RECRUITMENT INTELLIGENCE ─────────────────────
  server.tool("search_employers", "Search verified employer directory by name, industry, or location.", SearchEmployersInput.shape, wrap(searchEmployers, getAuth));
  server.tool("get_employer_profile", "Retrieve public employer profile and active job vacancies.", GetEmployerProfileInput.shape, wrap(getEmployerProfile, getAuth));
  server.tool("recruitment_insights", "Compile hiring velocity, remote ratio, and recruitment market trends.", RecruitmentInsightsInput.shape, wrap(recruitmentInsights, getAuth));
  server.tool("candidate_job_pipeline", "Retrieve employer-owned applicant pipeline subject to permissions.", CandidateJobPipelineInput.shape, wrap(candidateJobPipeline, getAuth));

  // ── GROUP F: TALENTXCEL PLATFORM INTELLIGENCE ──────────────────────────
  server.tool("platform_statistics", "Return verified, real-time aggregated platform statistics across jobs, employers, and learning modules.", PlatformStatisticsInput.shape, wrap(platformStatistics, getAuth));
  server.tool("search_platform_content", "Search authorized TalentXcel career guides, articles, and industry insights.", SearchPlatformContentInput.shape, wrap(searchPlatformContent, getAuth));
  server.tool("get_user_dashboard", "Return the authenticated user's dashboard metrics and recent applications.", GetUserDashboardInput.shape, wrap(getUserDashboard, getAuth));
  server.tool("get_user_notifications", "Retrieve the requesting user's platform notifications.", GetUserNotificationsInput.shape, wrap(getUserNotifications, getAuth));
  server.tool("search_learning_resources", "Search available courses, certifications, and career development modules.", SearchLearningResourcesInput.shape, wrap(searchLearningResources, getAuth));

  // ── UNIVERSAL SEARCH ───────────────────────────────────────────────────
  server.tool("universal_talent_search", "Unified natural language search engine across jobs, candidates, employers, skills, and salaries.", UniversalSearchInput.shape, wrap(universalTalentSearch, getAuth));
}

export function registerResources(server: McpServer): void {
  // 1. Overview
  server.resource("talentxcel-overview", "talentxcel://platform/overview", { mimeType: "application/json" }, async () => ({
    contents: [{
      uri: "talentxcel://platform/overview",
      mimeType: "application/json",
      text: JSON.stringify({
        platform: "TalentXcel.in",
        description: "Universal Career Intelligence & Recruitment Platform",
        version: "1.0.0",
        mcp_specification: "2024-11-05",
        total_registered_tools: 26,
        capabilities: ["job_intelligence", "candidate_intelligence", "resume_intelligence", "career_intelligence", "recruitment_intelligence", "universal_search"],
      }, null, 2),
    }],
  }));

  // 2. Trending Jobs Resource
  server.resource("talentxcel-trending-jobs", "talentxcel://jobs/trending", { mimeType: "application/json" }, async () => {
    const sb = createPublicSupabase();
    const { data } = await sb.from("jobs").select("id, title, company_name, location, salary_range, views_count").eq("is_active", true).order("views_count", { ascending: false, nullsFirst: false }).limit(10);
    return {
      contents: [{
        uri: "talentxcel://jobs/trending",
        mimeType: "application/json",
        text: JSON.stringify({ trending_jobs: data ?? [] }, null, 2),
      }],
    };
  });

  // 3. Career Resources Resource
  server.resource("talentxcel-career-resources", "talentxcel://careers/resources", { mimeType: "application/json" }, async () => {
    const sb = createPublicSupabase();
    const { data } = await sb.from("content_hub").select("id, title, excerpt, content_type").limit(10);
    return {
      contents: [{
        uri: "talentxcel://careers/resources",
        mimeType: "application/json",
        text: JSON.stringify({ career_resources: data ?? [] }, null, 2),
      }],
    };
  });

  // 4. Skills Catalog Resource
  server.resource("talentxcel-skills-catalog", "talentxcel://skills/catalog", { mimeType: "application/json" }, async () => {
    const sb = createPublicSupabase();
    const { data } = await sb.from("jobs").select("skills_required").eq("is_active", true).limit(50);
    const set = new Set<string>();
    (data ?? []).forEach(j => (Array.isArray(j.skills_required) ? j.skills_required : []).forEach((s: string) => set.add(s.trim())));
    return {
      contents: [{
        uri: "talentxcel://skills/catalog",
        mimeType: "application/json",
        text: JSON.stringify({ in_demand_skills: Array.from(set).slice(0, 30) }, null, 2),
      }],
    };
  });
}

export function registerPrompts(server: McpServer): void {
  server.prompt("career_coaching", "Get contextual career guidance tailored to your experience and goals", {
    question: z.string().describe("Your career question"),
    context: z.string().optional().describe("Domain context (job_search, salary, interview, resume)"),
  }, ({ question, context }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `I need career coaching guidance regarding: ${question}. Context: ${context || "general"}. Please use the career_coach, calculate_skill_gap, and skill_recommendations tools as needed.` },
    }],
  }));

  server.prompt("resume_review", "Complete ATS and content evaluation for your resume", {
    target_role: z.string().optional().describe("Target role to evaluate against"),
  }, ({ target_role }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Please review my resume profile${target_role ? ` for the role of ${target_role}` : ""}. Execute analyze_resume, get_resume_profile, and optimize_resume to provide comprehensive recommendations.` },
    }],
  }));

  server.prompt("job_search_assistant", "Discover matching jobs and analyze qualification alignment", {
    criteria: z.string().describe("Your job search criteria (role, location, salary, skills)"),
  }, ({ criteria }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Help me find opportunities for: ${criteria}. Use universal_talent_search and search_jobs, then compare results against market compensation using salary_insights.` },
    }],
  }));

  server.prompt("interview_preparation", "Technical and behavioral preparation for an upcoming interview", {
    role: z.string().describe("Role you are interviewing for"),
    company: z.string().optional().describe("Hiring organization"),
  }, ({ role, company }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `I have an interview for ${role}${company ? ` at ${company}` : ""}. Inspect skill_recommendations for ${role} and get_employer_profile if available to guide my preparation.` },
    }],
  }));

  server.prompt("employer_recruitment_assistant", "Assistance for recruiters and hiring managers", {
    role_to_fill: z.string().describe("Vacant role you are sourcing for"),
  }, ({ role_to_fill }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Help me source and evaluate candidates for ${role_to_fill}. Use recruitment_insights, search_candidates, and skill_recommendations to build a qualified pipeline.` },
    }],
  }));
}
