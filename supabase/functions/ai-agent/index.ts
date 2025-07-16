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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module, task, input, userId, prompt } = await req.json();
    
    console.log('AI Agent request:', { module, task, input: Object.keys(input || {}), userId });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemMessage = '';
    let userMessage = prompt || '';

    // Module-specific AI prompts and logic
    switch (module) {
      case 'network':
        systemMessage = 'You are a professional networking AI assistant helping users build meaningful connections, create engaging content, and grow their professional network.';
        if (task === 'generate_post') {
          userMessage = `Generate a professional LinkedIn-style post about: ${input.topic}. Make it engaging and include relevant hashtags.`;
        } else if (task === 'suggest_connections') {
          userMessage = `Based on the user's profile in ${input.industry}, suggest types of professionals they should connect with and why.`;
        }
        break;

      case 'jobs':
        systemMessage = 'You are a career AI assistant specializing in job search, resume optimization, and interview preparation.';
        if (task === 'match_jobs') {
          userMessage = `Based on this user profile: ${input.profile}, suggest how to improve job search strategy and what types of roles to target.`;
        } else if (task === 'interview_prep') {
          userMessage = `Generate 5 common interview questions for a ${input.role} position and provide sample answers.`;
        }
        break;

      case 'resume_builder':
        systemMessage = 'You are a resume optimization AI that helps create ATS-friendly, professional resumes.';
        if (task === 'optimize') {
          userMessage = `Review and provide suggestions to improve this resume for ATS optimization: ${input.resumeText}`;
        } else if (task === 'generate_summary') {
          userMessage = `Create a professional summary for a ${input.role} with ${input.experience} years of experience in ${input.industry}.`;
        }
        break;

      case 'employer':
        systemMessage = 'You are an HR AI assistant helping employers with recruitment, job descriptions, and candidate evaluation.';
        if (task === 'generate_jd') {
          userMessage = `Create a comprehensive job description for: ${input.jobTitle} at a ${input.companyType} company. Include responsibilities, requirements, and benefits.`;
        }
        break;

      case 'career_map':
        systemMessage = 'You are a career guidance AI that helps plan career paths, identify skill gaps, and set professional goals.';
        if (task === 'generate_roadmap') {
          userMessage = `Create a 5-year career roadmap from ${input.currentRole} to ${input.targetRole}. Include skills needed, milestones, and timeline.`;
        }
        break;

      case 'learning':
        systemMessage = 'You are an educational AI assistant that recommends courses, certifications, and learning paths.';
        if (task === 'recommend_courses') {
          userMessage = `Recommend learning resources and courses for someone wanting to transition from ${input.currentField} to ${input.targetField}.`;
        }
        break;

      case 'colleges':
        systemMessage = 'You are an educational counselor AI helping with college selection, applications, and academic planning.';
        if (task === 'recommend_colleges') {
          userMessage = `Suggest colleges/universities for ${input.course} with preferences: ${input.preferences}`;
        }
        break;

      default:
        systemMessage = 'You are TalentXcel AI, a comprehensive career development assistant.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log usage for analytics
    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        module_name: module,
        feature_type: task,
        request_type: 'chat',
        tokens_used: data.usage?.total_tokens || 0,
        success: true,
        response_time: Date.now(),
      });
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      tokens_used: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Agent error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});