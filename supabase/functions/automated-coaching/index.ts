import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, coachingType = 'weekly_checkin' } = await req.json();

    console.log('Generating coaching session for user:', userId, 'Type:', coachingType);

    // Get user's comprehensive data
    const userData = await getUserComprehensiveData(supabase, userId);
    
    // Generate coaching session using AI
    const coachingSession = await generateCoachingSession(userData, coachingType);
    
    // Store coaching session
    const { error: sessionError } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: userId,
        session_type: coachingType,
        content: coachingSession,
        created_at: new Date().toISOString(),
        status: 'active'
      });

    if (sessionError) {
      console.error('Error storing coaching session:', sessionError);
    }

    // Generate adaptive roadmap updates if needed
    const adaptiveUpdates = await generateAdaptiveUpdates(userData, coachingSession);

    return new Response(JSON.stringify({
      coachingSession,
      adaptiveUpdates,
      generatedAt: new Date().toISOString(),
      nextSessionRecommended: getNextSessionDate(coachingType)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in automated coaching:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: {
        message: "Keep up the great work! Continue with your current learning plan.",
        type: "encouragement"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserComprehensiveData(supabase: any, userId: string) {
  // Get user profile and career goals
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: goals } = await supabase
    .from('career_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  // Get current roadmap and progress
  const { data: roadmap } = await supabase
    .from('career_roadmaps')
    .select(`
      *,
      roadmap_phases(*, roadmap_tasks(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  // Get recent activities and skill progress
  const { data: recentActivities } = await supabase
    .from('user_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: skillProgress } = await supabase
    .from('skill_progress_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get recent recommendations and their status
  const { data: recommendations } = await supabase
    .from('ai_career_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    profile,
    currentGoal: goals?.[0],
    currentRoadmap: roadmap?.[0],
    recentActivities: recentActivities || [],
    skillProgress: skillProgress || [],
    recommendations: recommendations || []
  };
}

async function generateCoachingSession(userData: any, sessionType: string) {
  const { profile, currentGoal, currentRoadmap, recentActivities, skillProgress, recommendations } = userData;

  const coachingPrompt = `You are an AI career coach conducting a ${sessionType} session. Analyze the user's progress and provide personalized coaching.

User Profile: ${JSON.stringify(profile)}
Current Goal: ${JSON.stringify(currentGoal)}
Current Roadmap Progress: ${JSON.stringify(currentRoadmap)}
Recent Activities (last 20): ${JSON.stringify(recentActivities)}
Recent Skill Progress: ${JSON.stringify(skillProgress)}
Previous Recommendations: ${JSON.stringify(recommendations)}

Provide a comprehensive coaching session in this JSON format:
{
  "sessionType": "${sessionType}",
  "greeting": "Personalized greeting",
  "progressReview": {
    "highlights": ["Achievement 1", "Achievement 2"],
    "concerns": ["Area needing attention"],
    "metrics": {
      "activitiesThisWeek": 5,
      "skillImprovements": 3,
      "goalsProgress": "25%"
    }
  },
  "feedback": {
    "positive": ["What's going well"],
    "constructive": ["Areas for improvement"],
    "motivational": "Encouraging message"
  },
  "weeklyFocus": {
    "primaryGoal": "Main focus for next week",
    "secondaryGoals": ["Goal 2", "Goal 3"],
    "skillToImprove": "Specific skill to work on"
  },
  "actionItems": [
    {
      "task": "Specific task",
      "deadline": "Timeline",
      "priority": "high|medium|low",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "adaptiveRecommendations": {
    "paceAdjustment": "faster|slower|maintain",
    "focusShift": "New areas to focus on",
    "methodologyChanges": "Learning approach modifications"
  },
  "checkInQuestions": [
    "How are you feeling about your progress?",
    "What challenges are you facing?",
    "What would you like to focus on next?"
  ],
  "motivationalClose": "Inspiring closing message",
  "nextSteps": "Clear next actions"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI career coach providing personalized guidance and support.'
        },
        {
          role: 'user',
          content: coachingPrompt
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    // Fallback coaching session
    return {
      sessionType,
      greeting: `Hello! Time for your ${sessionType} check-in.`,
      progressReview: {
        highlights: ["Consistent learning", "Making progress"],
        concerns: ["Stay focused on goals"],
        metrics: {
          activitiesThisWeek: recentActivities.length,
          skillImprovements: skillProgress.length,
          goalsProgress: "Progressing well"
        }
      },
      feedback: {
        positive: ["Great dedication to learning"],
        constructive: ["Keep building momentum"],
        motivational: "You're doing excellent work!"
      },
      weeklyFocus: {
        primaryGoal: "Continue current learning path",
        secondaryGoals: ["Practice new skills", "Build portfolio"],
        skillToImprove: "Core competencies"
      },
      actionItems: [
        {
          task: "Complete next roadmap milestone",
          deadline: "End of week",
          priority: "high",
          resources: ["Learning materials", "Practice exercises"]
        }
      ],
      adaptiveRecommendations: {
        paceAdjustment: "maintain",
        focusShift: "Current focus is good",
        methodologyChanges: "Continue current approach"
      },
      checkInQuestions: [
        "How are you feeling about your progress?",
        "What challenges are you facing?",
        "What would you like to focus on next?"
      ],
      motivationalClose: "Keep up the excellent work! You're making real progress toward your goals.",
      nextSteps: "Continue with your current learning plan and complete this week's goals."
    };
  }
}

async function generateAdaptiveUpdates(userData: any, coachingSession: any) {
  const { adaptiveRecommendations } = coachingSession;
  
  if (!adaptiveRecommendations || adaptiveRecommendations.paceAdjustment === 'maintain') {
    return { updateRequired: false, message: 'No roadmap adjustments needed' };
  }

  return {
    updateRequired: true,
    paceAdjustment: adaptiveRecommendations.paceAdjustment,
    focusShift: adaptiveRecommendations.focusShift,
    methodologyChanges: adaptiveRecommendations.methodologyChanges,
    suggestedChanges: [
      'Adjust task deadlines based on current pace',
      'Modify learning approach for better results',
      'Add or remove tasks based on progress'
    ]
  };
}

function getNextSessionDate(sessionType: string) {
  const now = new Date();
  
  switch (sessionType) {
    case 'weekly_checkin':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly_review':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'milestone_celebration':
      now.setDate(now.getDate() + 14);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }
  
  return now.toISOString();
}