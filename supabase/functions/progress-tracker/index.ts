import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      userId, 
      roadmapId, 
      taskId, 
      phaseId, 
      completionData, 
      skillProgress,
      action 
    } = await req.json();

    console.log('Processing progress update:', { userId, action, taskId, phaseId });

    let result = {};

    switch (action) {
      case 'complete_task':
        result = await completeTask(supabase, userId, roadmapId, taskId, completionData);
        break;
      
      case 'complete_phase':
        result = await completePhase(supabase, userId, roadmapId, phaseId, completionData);
        break;
      
      case 'update_skill_progress':
        result = await updateSkillProgress(supabase, userId, skillProgress);
        break;
      
      case 'log_activity':
        result = await logActivity(supabase, userId, completionData);
        break;
      
      case 'get_progress_summary':
        result = await getProgressSummary(supabase, userId, roadmapId);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    // Calculate overall progress and achievements
    const progressStats = await calculateProgressStats(supabase, userId, roadmapId);
    
    // Check for new achievements
    const newAchievements = await checkAchievements(supabase, userId, progressStats);

    return new Response(JSON.stringify({
      ...result,
      progressStats,
      newAchievements,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in progress tracking:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function completeTask(supabase: any, userId: string, roadmapId: string, taskId: string, completionData: any) {
  // Update task completion
  const { error: updateError } = await supabase
    .from('roadmap_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_notes: completionData.notes || '',
      completion_rating: completionData.rating || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Log progress entry
  const { error: logError } = await supabase
    .from('progress_logs')
    .insert({
      user_id: userId,
      roadmap_id: roadmapId,
      task_id: taskId,
      activity_type: 'task_completion',
      details: completionData,
      created_at: new Date().toISOString()
    });

  if (logError) throw logError;

  return { success: true, message: 'Task completed successfully' };
}

async function completePhase(supabase: any, userId: string, roadmapId: string, phaseId: string, completionData: any) {
  // Update phase completion
  const { error: updateError } = await supabase
    .from('roadmap_phases')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_summary: completionData.summary || '',
      updated_at: new Date().toISOString()
    })
    .eq('id', phaseId)
    .eq('roadmap_id', roadmapId);

  if (updateError) throw updateError;

  // Log progress entry
  const { error: logError } = await supabase
    .from('progress_logs')
    .insert({
      user_id: userId,
      roadmap_id: roadmapId,
      phase_id: phaseId,
      activity_type: 'phase_completion',
      details: completionData,
      created_at: new Date().toISOString()
    });

  if (logError) throw logError;

  return { success: true, message: 'Phase completed successfully' };
}

async function updateSkillProgress(supabase: any, userId: string, skillProgress: any) {
  const { skill_id, progress_increment, evidence, source } = skillProgress;

  // Get current skill level
  const { data: currentSkill } = await supabase
    .from('user_skills')
    .select('proficiency_level')
    .eq('user_id', userId)
    .eq('skill_id', skill_id)
    .single();

  const newLevel = Math.min(10, (currentSkill?.proficiency_level || 0) + progress_increment);

  // Update or insert skill progress
  const { error: upsertError } = await supabase
    .from('user_skills')
    .upsert({
      user_id: userId,
      skill_id: skill_id,
      proficiency_level: newLevel,
      last_practiced: new Date().toISOString(),
      evidence: evidence,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,skill_id'
    });

  if (upsertError) throw upsertError;

  // Log skill progress
  const { error: logError } = await supabase
    .from('skill_progress_logs')
    .insert({
      user_id: userId,
      skill_id: skill_id,
      previous_level: currentSkill?.proficiency_level || 0,
      new_level: newLevel,
      progress_source: source,
      evidence: evidence,
      created_at: new Date().toISOString()
    });

  if (logError) throw logError;

  return { 
    success: true, 
    message: 'Skill progress updated',
    newLevel,
    improvement: progress_increment
  };
}

async function logActivity(supabase: any, userId: string, activityData: any) {
  const { error } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      activity_type: activityData.type,
      activity_description: activityData.description,
      duration_minutes: activityData.duration || null,
      outcomes: activityData.outcomes || null,
      metadata: activityData.metadata || {},
      created_at: new Date().toISOString()
    });

  if (error) throw error;

  return { success: true, message: 'Activity logged successfully' };
}

async function getProgressSummary(supabase: any, userId: string, roadmapId: string) {
  // Get roadmap progress
  const { data: roadmap } = await supabase
    .from('career_roadmaps')
    .select(`
      *,
      roadmap_phases(*, roadmap_tasks(*))
    `)
    .eq('id', roadmapId)
    .eq('user_id', userId)
    .single();

  if (!roadmap) throw new Error('Roadmap not found');

  // Calculate progress statistics
  const totalTasks = roadmap.roadmap_phases.reduce((sum: number, phase: any) => 
    sum + phase.roadmap_tasks.length, 0);
  
  const completedTasks = roadmap.roadmap_phases.reduce((sum: number, phase: any) => 
    sum + phase.roadmap_tasks.filter((task: any) => task.status === 'completed').length, 0);

  const completedPhases = roadmap.roadmap_phases.filter((phase: any) => 
    phase.status === 'completed').length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get skill improvements
  const { data: skillProgress } = await supabase
    .from('skill_progress_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', roadmap.created_at)
    .order('created_at', { ascending: false });

  return {
    roadmapId,
    totalPhases: roadmap.roadmap_phases.length,
    completedPhases,
    totalTasks,
    completedTasks,
    progressPercentage,
    skillImprovements: skillProgress?.length || 0,
    startDate: roadmap.created_at,
    estimatedCompletion: roadmap.target_completion_date,
    currentPhase: roadmap.roadmap_phases.find((phase: any) => phase.status === 'in_progress')?.title || 'Not started'
  };
}

async function calculateProgressStats(supabase: any, userId: string, roadmapId?: string) {
  const timeframe = new Date();
  timeframe.setDate(timeframe.getDate() - 30); // Last 30 days

  // Get activity counts
  const { data: activities } = await supabase
    .from('user_activity_logs')
    .select('activity_type, created_at')
    .eq('user_id', userId)
    .gte('created_at', timeframe.toISOString());

  // Get skill improvements
  const { data: skillGains } = await supabase
    .from('skill_progress_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', timeframe.toISOString());

  const totalActivities = activities?.length || 0;
  const totalSkillGains = skillGains?.reduce((sum, log) => 
    sum + (log.new_level - log.previous_level), 0) || 0;

  return {
    totalActivities,
    totalSkillGains,
    averageActivityPerDay: Math.round(totalActivities / 30 * 10) / 10,
    skillVelocity: Math.round(totalSkillGains / 30 * 10) / 10,
    timeframe: '30 days'
  };
}

async function checkAchievements(supabase: any, userId: string, progressStats: any) {
  const achievements = [];

  // Check for milestone achievements
  if (progressStats.totalActivities >= 50) {
    achievements.push({
      type: 'activity_milestone',
      title: 'Consistent Learner',
      description: '50+ activities completed',
      icon: '🎯'
    });
  }

  if (progressStats.totalSkillGains >= 10) {
    achievements.push({
      type: 'skill_milestone',
      title: 'Skill Builder',
      description: '10+ skill level improvements',
      icon: '📈'
    });
  }

  if (progressStats.averageActivityPerDay >= 2) {
    achievements.push({
      type: 'consistency',
      title: 'Daily Achiever',
      description: '2+ activities per day average',
      icon: '🔥'
    });
  }

  // Store new achievements
  for (const achievement of achievements) {
    const { error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        earned_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,achievement_type'
      });

    if (error) {
      console.error('Error storing achievement:', error);
    }
  }

  return achievements;
}