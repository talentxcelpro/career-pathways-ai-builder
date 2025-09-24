import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, function: 'agent-worker' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 Agent worker started at:', new Date().toISOString());

    // Get pending agent tasks
    const { data: pendingTasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('run_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    if (!pendingTasks?.length) {
      console.log('No pending tasks found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending tasks to process',
        processed: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${pendingTasks.length} pending tasks`);
    const processedTasks = [];

    for (const task of pendingTasks) {
      try {
        console.log(`Processing task ${task.id} - ${task.action}`);

        // Claim the task
        const { error: claimError } = await supabase
          .from('agent_tasks')
          .update({ 
            status: 'running', 
            started_at: new Date().toISOString(),
            attempts: task.attempts + 1
          })
          .eq('id', task.id)
          .eq('status', 'pending'); // Only update if still pending

        if (claimError) {
          console.error(`Failed to claim task ${task.id}:`, claimError);
          continue;
        }

        // Get the AI agent info
        const { data: agent, error: agentError } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', task.payload?.ai_agent_id)
          .single();

        if (agentError || !agent) {
          console.error(`Agent not found for task ${task.id}:`, agentError);
          await completeTask(supabase, task.id, false, 'Agent not found');
          continue;
        }

        // Generate content based on agent
        const postContent = generateAgentContent(agent);
        
        // Get agent's user ID for posting
        const { data: botUser, error: botError } = await supabase
          .from('ai_bots')
          .select('user_id')
          .eq('name', agent.display_name)
          .single();

        let userId = botUser?.user_id;

        // If no bot user, create a post as system content
        if (!userId) {
          // Store in bot_generated_content instead
          const { error: contentError } = await supabase
            .from('bot_generated_content')
            .insert({
              content_type: 'social_post',
              content: postContent,
              word_count: postContent.split(' ').length,
              seo_keywords: agent.content_domains || ['AI', 'agents'],
              generated_by: 'agent_worker',
              generation_prompt: `Agent ${agent.handle} scheduled task`,
              is_published: true,
              quality_score: 0.8,
              metadata: {
                agent_id: agent.id,
                agent_handle: agent.handle,
                task_id: task.id,
                generated_at: new Date().toISOString()
              }
            });

          if (contentError) {
            console.error(`Failed to save content for task ${task.id}:`, contentError);
            await completeTask(supabase, task.id, false, 'Failed to save content');
            continue;
          }

          console.log(`✅ Generated content for agent ${agent.handle}`);
        } else {
          // Create social media post
          const { error: postError } = await supabase
            .from('posts')
            .insert({
              user_id: userId,
              content: postContent,
              visibility: 'public',
              is_ai_generated: true,
              metadata: {
                agent_id: agent.id,
                agent_handle: agent.handle,
                task_id: task.id,
                automation_generated: true,
                generated_at: new Date().toISOString()
              }
            });

          if (postError) {
            console.error(`Failed to create post for task ${task.id}:`, postError);
            await completeTask(supabase, task.id, false, 'Failed to create post');
            continue;
          }

          console.log(`✅ Created post for agent ${agent.handle}`);
        }

        // Log agent activity
        const { error: logError } = await supabase
          .from('agent_logs')
          .insert({
            task_id: task.id,
            agent_id: agent.id,
            message: `Generated content: ${postContent.substring(0, 100)}...`,
            level: 'info',
            metadata: {
              content_type: 'social_post',
              word_count: postContent.split(' ').length
            }
          });

        // Complete the task
        await completeTask(supabase, task.id, true);
        
        processedTasks.push({
          task_id: task.id,
          agent_handle: agent.handle,
          content_preview: postContent.substring(0, 100) + '...'
        });

      } catch (taskError) {
        console.error(`Error processing task ${task.id}:`, taskError);
        await completeTask(supabase, task.id, false, (taskError as Error).message);
      }
    }

    console.log(`✅ Processed ${processedTasks.length} tasks successfully`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedTasks.length} agent tasks`,
      processed: processedTasks.length,
      tasks: processedTasks,
      timestamp: new Date().toISOString()
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Agent worker error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

async function completeTask(supabase: any, taskId: string, success: boolean, errorMessage?: string) {
  const updateData = success ? {
    status: 'completed',
    completed_at: new Date().toISOString()
  } : {
    status: 'failed',
    error_message: errorMessage,
    completed_at: new Date().toISOString()
  };

  await supabase
    .from('agent_tasks')
    .update(updateData)
    .eq('id', taskId);
}

function generateAgentContent(agent: any): string {
  const domains = agent.content_domains || ['professional development'];
  const primaryDomain = domains[0] || 'career growth';
  const role = agent.role || 'Professional';
  const handle = agent.handle || 'agent';
  const tone = agent.tone || 'professional';

  const templates = {
    professional: [
      `💼 ${role} insight: Success in ${primaryDomain} requires consistent daily actions. Small improvements compound over time. What's your focus area this week?`,
      `🚀 Quick tip from ${handle}: In ${primaryDomain}, clarity beats complexity. Define your goals, break them down, and execute systematically.`,
      `✨ ${primaryDomain} spotlight: The most successful professionals invest in continuous learning. What skill are you developing this month?`,
      `🎯 ${role} perspective: ${primaryDomain} is evolving rapidly. Stay curious, adapt quickly, and always add value to your network.`
    ],
    friendly: [
      `Hey there! 👋 ${handle} here with a quick ${primaryDomain} tip: Your career journey is unique - don't compare your chapter 3 to someone else's chapter 20!`,
      `🌟 Friendly reminder: In ${primaryDomain}, relationships matter just as much as skills. Be genuine, help others, and watch opportunities unfold!`,
      `😊 ${role} sharing: The best part about ${primaryDomain}? Every challenge is a chance to grow. What challenge turned into your biggest win?`,
      `💡 Quick thought: ${primaryDomain} success isn't just about what you know - it's about who you become along the way. Keep growing!`
    ],
    informative: [
      `📊 ${primaryDomain} Update: Industry trends show increasing demand for adaptable professionals. Key areas to focus on: continuous learning, digital literacy, and soft skills.`,
      `📈 ${role} Analysis: Current ${primaryDomain} landscape requires both technical expertise and emotional intelligence. Balance is key to long-term success.`,
      `🔍 Research shows: Professionals in ${primaryDomain} who invest 30 minutes daily in skill development see 23% faster career progression. Time to invest in yourself!`,
      `📝 ${primaryDomain} Facts: The most valuable professionals are those who can bridge technical skills with business understanding. Where do you stand?`
    ]
  };

  const toneTemplates = templates[tone as keyof typeof templates] || templates.professional;
  const content = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

  // Add relevant hashtags
  const hashtags = [
    '#TalentXcel',
    `#${primaryDomain.replace(/\s+/g, '')}`,
    '#CareerGrowth',
    '#ProfessionalDevelopment',
    '#SkillBuilding'
  ].slice(0, 4);

  return `${content}\n\n${hashtags.join(' ')}`;
}