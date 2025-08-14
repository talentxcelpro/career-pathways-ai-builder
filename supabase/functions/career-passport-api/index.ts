import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

interface CareerPassportRequest {
  action: 'get' | 'update' | 'create';
  userId: string;
  updates?: Record<string, any>;
}

interface CareerPassportResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: CareerPassportRequest;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body",
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Career Passport API called:", body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result: CareerPassportResponse = {
      success: false,
      timestamp: new Date().toISOString()
    };

    switch (body.action) {
      case 'get':
        result = await getCareerPassport(supabase, body.userId);
        break;
      case 'update':
        result = await updateCareerPassport(supabase, body.userId, body.updates || {});
        break;
      case 'create':
        result = await createCareerPassport(supabase, body.userId);
        break;
      default:
        result = {
          success: false,
          error: 'Invalid action. Use: get, update, or create',
          timestamp: new Date().toISOString()
        };
    }

    console.log("Career Passport API result:", result);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Career Passport API error:", error);
    
    const errorResponse: CareerPassportResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

async function getCareerPassport(supabase: any, userId: string): Promise<CareerPassportResponse> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // Get career passport data
    const { data: passport, error: passportError } = await supabase
      .from('career_passport')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If passport doesn't exist, create one
    if (passportError && passportError.code === 'PGRST116') {
      console.log("Creating new career passport for user:", userId);
      return await createCareerPassport(supabase, userId);
    }

    if (passportError) {
      console.error("Career passport fetch error:", passportError);
      return {
        success: false,
        error: 'Failed to fetch career passport data',
        timestamp: new Date().toISOString()
      };
    }

    // Calculate completion percentage
    const completionData = calculateCompletion(profile, passport);

    return {
      success: true,
      data: {
        profile: profile || getDefaultProfile(userId),
        passport: passport || getDefaultPassport(userId),
        completion: completionData
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Get career passport error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get career passport',
      timestamp: new Date().toISOString()
    };
  }
}

async function createCareerPassport(supabase: any, userId: string): Promise<CareerPassportResponse> {
  try {
    const defaultPassport = getDefaultPassport(userId);
    
    const { data, error } = await supabase
      .from('career_passport')
      .insert([defaultPassport])
      .select()
      .single();

    if (error) {
      console.error("Career passport creation error:", error);
      return {
        success: false,
        error: 'Failed to create career passport',
        timestamp: new Date().toISOString()
      };
    }

    console.log("Created career passport:", data);

    return {
      success: true,
      data: {
        passport: data,
        completion: calculateCompletion(null, data)
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Create career passport error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create career passport',
      timestamp: new Date().toISOString()
    };
  }
}

async function updateCareerPassport(supabase: any, userId: string, updates: Record<string, any>): Promise<CareerPassportResponse> {
  try {
    const { data, error } = await supabase
      .from('career_passport')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("Career passport update error:", error);
      return {
        success: false,
        error: 'Failed to update career passport',
        timestamp: new Date().toISOString()
      };
    }

    console.log("Updated career passport:", data);

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Update career passport error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update career passport',
      timestamp: new Date().toISOString()
    };
  }
}

function getDefaultProfile(userId: string) {
  return {
    id: userId,
    name: 'TalentXcel Professional',
    tagline: 'Transforming careers, one step at a time',
    location: 'Remote',
    email: 'user@talentxcel.com',
    website: null,
    member_id: `TXL${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    profile_completion: 25,
    career_readiness_score: 30,
    market_competitiveness_score: 25,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getDefaultPassport(userId: string) {
  return {
    user_id: userId,
    resumes_created: 0,
    jobs_applied: 0,
    certifications: 0,
    tests_completed: 0,
    milestones: {},
    achievements: {},
    journey: {
      started_at: new Date().toISOString(),
      current_phase: 'exploration',
      goals: []
    },
    completion_percentage: 0,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function calculateCompletion(profile: any, passport: any) {
  let score = 0;
  let maxScore = 100;

  // Profile completion (40%)
  if (profile) {
    if (profile.name && profile.name !== 'TalentXcel Professional') score += 10;
    if (profile.tagline) score += 10;
    if (profile.location) score += 5;
    if (profile.email) score += 5;
    if (profile.website) score += 10;
  }

  // Career passport progress (60%)
  if (passport) {
    score += Math.min(passport.resumes_created * 10, 20); // Max 20 points
    score += Math.min(passport.jobs_applied * 2, 20); // Max 20 points
    score += Math.min(passport.certifications * 5, 10); // Max 10 points
    score += Math.min(passport.tests_completed * 5, 10); // Max 10 points
  }

  return {
    percentage: Math.min(score, maxScore),
    profile_score: Math.min(40, score),
    career_score: Math.min(60, score - 40),
    next_steps: getNextSteps(score)
  };
}

function getNextSteps(currentScore: number): string[] {
  const steps = [];
  
  if (currentScore < 30) {
    steps.push("Complete your profile information");
    steps.push("Upload a professional photo");
    steps.push("Create your first resume");
  } else if (currentScore < 60) {
    steps.push("Apply to relevant job openings");
    steps.push("Earn a professional certification");
    steps.push("Take skills assessments");
  } else {
    steps.push("Expand your professional network");
    steps.push("Update your career goals");
    steps.push("Explore advanced learning paths");
  }
  
  return steps;
}