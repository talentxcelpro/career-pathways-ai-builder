import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return json({ success: false, error: "Invalid JSON in request body", timestamp: now() }, 400);
    }

    console.log("Career Passport API called:", body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const action = body.action;
    const userId: string | null = body.userId ?? body.user_id ?? null;
    if (!userId) {
      return json({ success: false, error: "userId is required", timestamp: now() }, 400);
    }

    switch (action) {
      case "get": {
        const result = await getCareerPassport(supabase, userId);
        return json(result, result.success ? 200 : 400);
      }

      case "create": {
        const result = await upsertCareerPassport(supabase, userId, getDefaultPassport(userId));
        return json(result, result.success ? 200 : 400);
      }

      case "update": {
        const updates = isPlainObject(body.updates) ? body.updates : {};
        // If the record doesn't exist, we create it first, then merge updates.
        const ensure = await upsertCareerPassport(supabase, userId, getDefaultPassport(userId));
        if (!ensure.success) return json(ensure, 400);

        const { data, error } = await supabase
          .from("career_passport")
          .update({ ...updates, updated_at: now() })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Career passport update error:", error);
          return json({ success: false, error: "Failed to update career passport", timestamp: now() }, 400);
        }

        return json({ success: true, data, timestamp: now() });
      }

      default:
        return json(
          { success: false, error: "Invalid action. Use: get, update, or create", timestamp: now() },
          400
        );
    }
  } catch (error) {
    console.error("Career Passport API error:", error);
    return json({ success: false, error: getErrMsg(error), timestamp: now() }, 500);
  }
});

/** Logic */
async function getCareerPassport(supabase: ReturnType<typeof createClient>, userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) console.warn("Profile fetch warning:", profileError);

    const { data: passport, error: passportError } = await supabase
      .from("career_passport")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Not found → create default
    if (!passport) {
      const created = await upsertCareerPassport(supabase, userId, getDefaultPassport(userId));
      if (!created.success) return created;
      return {
        success: true,
        data: {
          profile: profile ?? getDefaultProfile(userId),
          passport: created.data,
          completion: calculateCompletion(profile ?? getDefaultProfile(userId), created.data),
        },
        timestamp: now(),
      };
    }

    return {
      success: true,
      data: {
        profile: profile ?? getDefaultProfile(userId),
        passport,
        completion: calculateCompletion(profile ?? getDefaultProfile(userId), passport),
      },
      timestamp: now(),
    };
  } catch (error) {
    console.error("Get career passport error:", error);
    return { success: false, error: getErrMsg(error), timestamp: now() };
  }
}

async function upsertCareerPassport(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: Record<string, unknown>
) {
  try {
    const { data, error } = await supabase
      .from("career_passport")
      .upsert({ ...payload, user_id: userId, updated_at: now() }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Career passport upsert error:", error);
      return { success: false, error: "Failed to create career passport", timestamp: now() };
    }

    return { success: true, data, timestamp: now() };
  } catch (error) {
    console.error("Create/update career passport error:", error);
    return { success: false, error: getErrMsg(error), timestamp: now() };
  }
}

/** Utils / Scoring */
function getDefaultProfile(userId: string) {
  return {
    id: userId,
    name: "TalentXcel Professional",
    tagline: "Transforming careers, one step at a time",
    location: "Remote",
    email: "user@talentxcel.com",
    website: null,
    member_id: `TXL${(Math.random().toString(36).slice(2, 8)).toUpperCase()}`,
    profile_completion: 25,
    career_readiness_score: 30,
    market_competitiveness_score: 25,
    last_activity: now(),
    created_at: now(),
    updated_at: now(),
  };
}

function getDefaultPassport(userId: string) {
  return {
    user_id: userId,
    completion_percentage: 0,
    career_readiness_score: 30,
    market_competitiveness_score: 25,
    resumes_count: 0,
    jobs_applied_count: 0,
    certifications_count: 0,
    tests_completed_count: 0,
    skills_verified_count: 0,
    connections_count: 0,
    last_activity_at: now(),
    career_milestones: [],
    learning_progress: {},
    recommendation_engine_data: {},
    created_at: now(),
    updated_at: now(),
  };
}

function calculateCompletion(profile: any, passport: any) {
  let score = 0;
  // Profile (40)
  if (profile) {
    if (profile.name && profile.name !== "TalentXcel Professional") score += 10;
    if (profile.tagline) score += 10;
    if (profile.location) score += 5;
    if (profile.email) score += 5;
    if (profile.website) score += 10;
  }
  // Passport (60)
  if (passport) {
    score += Math.min((passport.resumes_count ?? 0) * 10, 20);
    score += Math.min((passport.jobs_applied_count ?? 0) * 2, 20);
    score += Math.min((passport.certifications_count ?? 0) * 5, 10);
    score += Math.min((passport.tests_completed_count ?? 0) * 5, 10);
  }
  return {
    percentage: Math.min(score, 100),
    profile_score: Math.min(40, score),
    career_score: Math.min(60, Math.max(0, score - 40)),
    next_steps: getNextSteps(score),
  };
}

function getNextSteps(currentScore: number) {
  const steps: string[] = [];
  if (currentScore < 30) {
    steps.push("Complete your profile information", "Upload a professional photo", "Create your first resume");
  } else if (currentScore < 60) {
    steps.push("Apply to relevant job openings", "Earn a professional certification", "Take skills assessments");
  } else {
    steps.push("Expand your professional network", "Update your career goals", "Explore advanced learning paths");
  }
  return steps;
}

/** response helpers */
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function now() { return new Date().toISOString(); }
function getErrMsg(e: unknown) { return e instanceof Error ? e.message : "Internal server error"; }
function isPlainObject(v: unknown) { return v !== null && typeof v === "object" && !Array.isArray(v); }