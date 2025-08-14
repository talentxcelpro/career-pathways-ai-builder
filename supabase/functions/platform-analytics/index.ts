import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

interface PlatformAnalyticsRequest {
  action: 'get' | 'track';
  userId: string;
  eventType?: string;
  moduleName?: string;
  eventData?: Record<string, any>;
}

interface PlatformAnalyticsResponse {
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
    let body: PlatformAnalyticsRequest;
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

    console.log("Platform Analytics called:", body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result: PlatformAnalyticsResponse = {
      success: false,
      timestamp: new Date().toISOString()
    };

    switch (body.action) {
      case 'track':
        result = await trackEvent(supabase, body);
        break;
      case 'get':
        result = await getAnalytics(supabase, body.userId);
        break;
      default:
        result = {
          success: false,
          error: 'Invalid action. Use: track or get',
          timestamp: new Date().toISOString()
        };
    }

    console.log("Platform Analytics result:", result);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Platform Analytics error:", error);
    
    const errorResponse: PlatformAnalyticsResponse = {
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

async function trackEvent(supabase: any, request: PlatformAnalyticsRequest): Promise<PlatformAnalyticsResponse> {
  try {
    if (!request.eventType) {
      return {
        success: false,
        error: 'eventType is required for tracking',
        timestamp: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('platform_analytics')
      .insert({
        user_id: request.userId,
        event_type: request.eventType,
        module_name: request.moduleName,
        event_data: request.eventData || {},
        session_id: generateSessionId(),
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Analytics tracking error:", error);
      return {
        success: false,
        error: 'Failed to track event',
        timestamp: new Date().toISOString()
      };
    }

    // Update module progress if applicable
    if (request.moduleName) {
      await updateModuleProgress(supabase, request.userId, request.moduleName, request.eventType);
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Track event error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
      timestamp: new Date().toISOString()
    };
  }
}

async function getAnalytics(supabase: any, userId: string): Promise<PlatformAnalyticsResponse> {
  try {
    // Get recent analytics events
    const { data: events, error: eventsError } = await supabase
      .from('platform_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (eventsError) {
      console.error("Analytics fetch error:", eventsError);
      return {
        success: false,
        error: 'Failed to fetch analytics',
        timestamp: new Date().toISOString()
      };
    }

    // Get module progress
    const { data: moduleProgress, error: progressError } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.error("Module progress fetch error:", progressError);
    }

    // Get career passport data
    const { data: passport, error: passportError } = await supabase
      .from('career_passport')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (passportError && passportError.code !== 'PGRST116') {
      console.error("Career passport fetch error:", passportError);
    }

    // Calculate analytics summary
    const analyticsData = calculateAnalyticsSummary(events, moduleProgress, passport);

    return {
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Get analytics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get analytics',
      timestamp: new Date().toISOString()
    };
  }
}

async function updateModuleProgress(supabase: any, userId: string, moduleName: string, eventType: string) {
  try {
    // Get current progress
    const { data: currentProgress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .single();

    const timeSpentIncrement = getTimeSpentForEvent(eventType);
    const completionIncrement = getCompletionIncrementForEvent(eventType);

    if (currentProgress) {
      // Update existing progress
      await supabase
        .from('module_progress')
        .update({
          last_accessed: new Date().toISOString(),
          time_spent_minutes: (currentProgress.time_spent_minutes || 0) + timeSpentIncrement,
          completion_percentage: Math.min(100, (currentProgress.completion_percentage || 0) + completionIncrement),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('module_name', moduleName);
    } else {
      // Create new progress record
      await supabase
        .from('module_progress')
        .insert({
          user_id: userId,
          module_name: moduleName,
          completion_percentage: completionIncrement,
          time_spent_minutes: timeSpentIncrement,
          last_accessed: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error("Update module progress error:", error);
  }
}

function calculateAnalyticsSummary(events: any[], moduleProgress: any[], passport: any) {
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  const moduleUsage = events.reduce((acc, event) => {
    if (event.module_name) {
      acc[event.module_name] = (acc[event.module_name] || 0) + 1;
    }
    return acc;
  }, {});

  const totalTimeSpent = moduleProgress?.reduce((total, progress) => {
    return total + (progress.time_spent_minutes || 0);
  }, 0) || 0;

  const avgCompletionPercentage = moduleProgress?.length > 0 
    ? moduleProgress.reduce((total, progress) => total + (progress.completion_percentage || 0), 0) / moduleProgress.length
    : 0;

  return {
    summary: {
      total_events: events.length,
      total_time_spent_minutes: totalTimeSpent,
      avg_module_completion: Math.round(avgCompletionPercentage),
      active_modules: moduleProgress?.length || 0
    },
    event_counts: eventCounts,
    module_usage: moduleUsage,
    module_progress: moduleProgress || [],
    career_passport: passport,
    recent_events: events.slice(0, 10) // Last 10 events
  };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getTimeSpentForEvent(eventType: string): number {
  const timeMap: Record<string, number> = {
    'page_view': 1,
    'feature_used': 2,
    'profile_updated': 5,
    'resume_created': 15,
    'job_applied': 10,
    'qr_code_generated': 2,
    'module_completed': 30
  };
  
  return timeMap[eventType] || 1;
}

function getCompletionIncrementForEvent(eventType: string): number {
  const completionMap: Record<string, number> = {
    'profile_updated': 5,
    'resume_created': 20,
    'job_applied': 10,
    'certification_earned': 15,
    'test_completed': 10,
    'qr_code_generated': 5,
    'module_completed': 25
  };
  
  return completionMap[eventType] || 1;
}