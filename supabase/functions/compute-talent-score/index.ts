import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CACHE_AGE_MS = 6 * 60 * 60 * 1000;

type ScoreBand = "Building" | "Emerging" | "Strong" | "Elite";

type ScoreCategory = {
  key: string;
  label: string;
  score: number;
  max: number;
  summary: string;
  signals: string[];
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  impact: number;
  route: string;
  category: string;
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const countRows = async (label: string, query: PromiseLike<{ count: number | null; error: { message?: string } | null }>) => {
  const { count, error } = await query;
  if (error) {
    console.warn(`TalentScore count skipped for ${label}:`, error.message);
    return 0;
  }
  return count ?? 0;
};

const maybeSingle = async <T>(
  label: string,
  query: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>,
) => {
  const { data, error } = await query;
  if (error && error.code !== "PGRST116") {
    console.warn(`TalentScore read skipped for ${label}:`, error.message);
  }
  return data ?? null;
};

const getBand = (score: number): ScoreBand => {
  if (score >= 850) return "Elite";
  if (score >= 700) return "Strong";
  if (score >= 550) return "Emerging";
  return "Building";
};

const buildRecommendation = (
  id: string,
  title: string,
  description: string,
  impact: number,
  route: string,
  category: string,
): Recommendation => ({ id, title, description, impact, route, category });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Authorization required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "Supabase configuration is incomplete" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user?.id) {
      return json({ error: "Invalid authorization token" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const latest = await maybeSingle<any>(
      "latest talent score",
      admin
        .from("talent_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );

    if (!force && latest?.computed_at) {
      const computedAt = new Date(latest.computed_at).getTime();
      if (Number.isFinite(computedAt) && Date.now() - computedAt < MAX_CACHE_AGE_MS) {
        return json({ talentScore: latest, cached: true });
      }
    }

    const profile = await maybeSingle<any>(
      "profile",
      admin
        .from("profiles")
        .select("id, full_name, headline, title, current_job_title, current_company, location, industry, skills, verified_skills, experience_years, years_of_experience, education_history, work_experiences, resume_url, portfolio_url, linkedin_url, github_url, profile_views_count, career_goals, onboarding_completed, profile_completed")
        .eq("id", user.id)
        .maybeSingle(),
    );

    const careerPassport = await maybeSingle<any>(
      "career passport",
      admin
        .from("career_passport")
        .select("completion_percentage, career_readiness_score, market_competitiveness_score, resumes_count, jobs_applied_count, certifications_count, tests_completed_count, skills_verified_count, connections_count")
        .eq("user_id", user.id)
        .maybeSingle(),
    );

    const [
      resumeCount,
      aiResumeCount,
      applicationCount,
      enhancedApplicationCount,
      connectionCount,
      enrollmentCount,
      completedCourseCount,
      certificationCount,
      verifiedCertificationCount,
      achievementCount,
    ] = await Promise.all([
      countRows("resumes", admin.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows("ai_resumes", admin.from("ai_resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows("job_applications", admin.from("job_applications").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows("enhanced_job_applications", admin.from("enhanced_job_applications").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows(
        "connections",
        admin
          .from("connections")
          .select("id", { count: "exact", head: true })
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq("status", "accepted"),
      ),
      countRows("course_enrollments", admin.from("course_enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows(
        "completed course enrollments",
        admin
          .from("course_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .or("status.eq.completed,progress_percentage.gte.95"),
      ),
      countRows("skill_certifications", admin.from("skill_certifications").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
      countRows(
        "verified skill certifications",
        admin
          .from("skill_certifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_verified", true),
      ),
      countRows("career_achievements", admin.from("career_achievements").select("id", { count: "exact", head: true }).eq("user_id", user.id)),
    ]);

    const achievements = await admin
      .from("career_achievements")
      .select("points_awarded")
      .eq("user_id", user.id)
      .limit(50);

    const achievementPoints = achievements.data?.reduce(
      (total: number, item: { points_awarded?: number | null }) => total + (item.points_awarded ?? 0),
      0,
    ) ?? 0;

    const skills = toArray(profile?.skills);
    const verifiedSkills = toArray(profile?.verified_skills);
    const experienceYears = Number(profile?.experience_years ?? profile?.years_of_experience ?? 0);
    const totalResumes = Math.max(resumeCount + aiResumeCount, careerPassport?.resumes_count ?? 0);
    const totalApplications = Math.max(applicationCount + enhancedApplicationCount, careerPassport?.jobs_applied_count ?? 0);
    const totalConnections = Math.max(connectionCount, careerPassport?.connections_count ?? 0);
    const totalCertifications = Math.max(certificationCount, careerPassport?.certifications_count ?? 0);
    const totalVerifiedSkills = Math.max(verifiedSkills.length, verifiedCertificationCount, careerPassport?.skills_verified_count ?? 0);

    const profileFields = [
      profile?.full_name,
      profile?.headline ?? profile?.title ?? profile?.current_job_title,
      profile?.location,
      profile?.industry,
      profile?.current_company,
      profile?.resume_url,
      profile?.portfolio_url,
      profile?.linkedin_url,
      profile?.github_url,
      skills.length > 0,
      toArray(profile?.career_goals).length > 0,
      toArray(profile?.work_experiences).length > 0 || experienceYears > 0,
    ];
    const profileCompletion = profileFields.filter(Boolean).length / profileFields.length;

    const skillsScore = clamp(
      skills.length * 18 + totalVerifiedSkills * 32 + totalCertifications * 18 + (careerPassport?.career_readiness_score ?? 0) * 0.9,
      0,
      300,
    );

    const experienceScore = clamp(
      experienceYears * 28 +
        (profile?.current_job_title || profile?.title ? 35 : 0) +
        (profile?.current_company ? 30 : 0) +
        totalApplications * 7 +
        totalResumes * 12 +
        profileCompletion * 45,
      0,
      250,
    );

    const networkScore = clamp(
      totalConnections * 5 +
        (profile?.profile_views_count ?? 0) * 0.7 +
        (profile?.linkedin_url ? 18 : 0) +
        (profile?.location ? 12 : 0) +
        (profile?.portfolio_url || profile?.github_url ? 15 : 0),
      0,
      150,
    );

    const learningScore = clamp(
      enrollmentCount * 16 + completedCourseCount * 36 + totalCertifications * 24 + (careerPassport?.tests_completed_count ?? 0) * 18,
      0,
      150,
    );

    const achievementsScore = clamp(
      achievementCount * 18 + achievementPoints * 0.35 + (profile?.achievement_score ?? 0) * 0.5 + totalResumes * 8,
      0,
      150,
    );

    const breakdown: ScoreCategory[] = [
      {
        key: "skills",
        label: "Skills",
        score: skillsScore,
        max: 300,
        summary: `${skills.length} listed, ${totalVerifiedSkills} verified`,
        signals: ["listed skills", "verified skills", "certifications", "career readiness"],
      },
      {
        key: "experience",
        label: "Experience",
        score: experienceScore,
        max: 250,
        summary: `${experienceYears || 0} years, ${totalApplications} applications`,
        signals: ["years of experience", "current role", "company", "resume activity"],
      },
      {
        key: "network",
        label: "Network",
        score: networkScore,
        max: 150,
        summary: `${totalConnections} accepted connections`,
        signals: ["accepted connections", "profile views", "public proof links"],
      },
      {
        key: "learning",
        label: "Learning",
        score: learningScore,
        max: 150,
        summary: `${completedCourseCount} completed, ${enrollmentCount} enrolled`,
        signals: ["course progress", "completion velocity", "skill tests"],
      },
      {
        key: "achievements",
        label: "Achievements",
        score: achievementsScore,
        max: 150,
        summary: `${achievementCount} achievements, ${achievementPoints} points`,
        signals: ["achievements", "projects", "proof of work", "passport activity"],
      },
    ];

    const score = clamp(breakdown.reduce((total, category) => total + category.score, 0), 0, 1000);
    const previousScore = latest?.score ?? null;
    const delta = previousScore === null ? 0 : score - previousScore;
    const percentile = clamp(12 + (score / 1000) * 82, 1, 99);
    const band = getBand(score);

    const recommendations: Recommendation[] = [];
    if (skillsScore < 210) {
      recommendations.push(buildRecommendation(
        "verify-skills",
        "Verify three priority skills",
        "Add proof for the skills recruiters filter on first.",
        60,
        "/skills-verification",
        "skills",
      ));
    }
    if (experienceScore < 170) {
      recommendations.push(buildRecommendation(
        "complete-profile-proof",
        "Add role, company, and proof links",
        "A complete profile gives the score enough evidence to rank you confidently.",
        45,
        "/profile",
        "experience",
      ));
    }
    if (networkScore < 85) {
      recommendations.push(buildRecommendation(
        "build-signal-network",
        "Connect with ten relevant people",
        "Prioritize people at target companies and people in your role.",
        35,
        "/network",
        "network",
      ));
    }
    if (learningScore < 90) {
      recommendations.push(buildRecommendation(
        "finish-learning-loop",
        "Complete one job-linked course",
        "Finishing a course improves learning velocity and unlocks stronger job-match signals.",
        35,
        "/learning",
        "learning",
      ));
    }
    if (achievementsScore < 90) {
      recommendations.push(buildRecommendation(
        "publish-proof",
        "Publish one achievement or project",
        "Projects and achievements are harder to fake than profile claims.",
        30,
        "/achievements",
        "achievements",
      ));
    }

    const signals = {
      profile_completion: Math.round(profileCompletion * 100),
      skills_count: skills.length,
      verified_skills_count: totalVerifiedSkills,
      resumes_count: totalResumes,
      applications_count: totalApplications,
      connections_count: totalConnections,
      enrollments_count: enrollmentCount,
      completed_courses_count: completedCourseCount,
      certifications_count: totalCertifications,
      achievements_count: achievementCount,
      achievement_points: achievementPoints,
    };

    const computedAt = new Date().toISOString();
    const payload = {
      user_id: user.id,
      score,
      previous_score: previousScore,
      delta,
      percentile,
      band,
      breakdown,
      signals,
      recommendations: recommendations.slice(0, 5),
      computed_at: computedAt,
    };

    const { data: talentScore, error: insertError } = await admin
      .from("talent_scores")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error("TalentScore insert failed:", insertError);
      return json({ error: "Unable to store TalentScore" }, 500);
    }

    return json({ talentScore, cached: false });
  } catch (error) {
    console.error("compute-talent-score error:", error);
    return json({
      error: error instanceof Error ? error.message : "Internal server error",
    }, 500);
  }
});
