import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepSeekApiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return new Response(JSON.stringify({ error: 'DeepSeek API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jobId, jobData } = await req.json();

    if (!jobId || !jobData) {
      return new Response(JSON.stringify({ error: 'Job ID and data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔍 Analyzing job quality for job: ${jobId}`);

    // Call DeepSeek AI to analyze job quality
    const prompt = `Analyze this job description for quality and provide a JSON response:

Job Title: ${jobData.title}
Company: ${jobData.company_name || 'Not specified'}
Location: ${jobData.location || 'Not specified'}
Description: ${jobData.description || 'Not specified'}
Requirements: ${jobData.requirements || 'Not specified'}
Salary: ${jobData.salary_range || 'Not specified'}

Please analyze and provide a JSON response with these exact fields:
{
  "clarity_score": <number 1-10>, // How clear and well-written is the description
  "spam_probability": <number 0.0-1.0>, // Likelihood this is spam/fake (0=legitimate, 1=definitely spam)
  "completeness_score": <number 1-10>, // How complete is the job information
  "overall_score": <number 0.0-10.0>, // Overall quality score
  "ai_feedback": "<string>", // Brief feedback on quality issues
  "assessment_status": "<pending|approved|rejected|flagged>" // Overall recommendation
}

Guidelines:
- clarity_score: Clear role, responsibilities, qualifications = 8-10, vague = 1-3
- spam_probability: "Get rich quick", unrealistic salary, poor grammar = high, professional = low
- completeness_score: All key details present = 8-10, missing important info = 1-3
- overall_score: Average of other scores
- assessment_status: "approved" if overall_score >= 7, "flagged" if 4-6, "rejected" if < 4
- ai_feedback: 1-2 sentences explaining the assessment

Only return the JSON object, no other text.`;

    const deepSeekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepSeekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a job quality assessment expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!deepSeekResponse.ok) {
      console.error('DeepSeek API error:', await deepSeekResponse.text());
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deepSeekData = await deepSeekResponse.json();
    const aiResponse = deepSeekData.choices[0].message.content;

    let qualityData;
    try {
      qualityData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback quality assessment
      qualityData = {
        clarity_score: 5,
        spam_probability: 0.5,
        completeness_score: 5,
        overall_score: 5.0,
        ai_feedback: 'Could not analyze job quality properly',
        assessment_status: 'flagged'
      };
    }

    // Store quality assessment in database
    const { error: insertError } = await supabase
      .from('job_quality_scores')
      .insert({
        job_id: jobId,
        clarity_score: qualityData.clarity_score,
        spam_probability: qualityData.spam_probability,
        completeness_score: qualityData.completeness_score,
        overall_score: qualityData.overall_score,
        ai_feedback: qualityData.ai_feedback,
        assessment_status: qualityData.assessment_status
      });

    if (insertError) {
      console.error('Failed to store quality assessment:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store assessment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update job status based on assessment
    if (qualityData.assessment_status === 'rejected') {
      await supabase
        .from('jobs')
        .update({ is_active: false, status: 'rejected' })
        .eq('id', jobId);
    } else if (qualityData.assessment_status === 'approved') {
      await supabase
        .from('jobs')
        .update({ is_active: true, status: 'active' })
        .eq('id', jobId);
    }

    console.log(`✅ Job quality analysis completed: ${qualityData.assessment_status} (Score: ${qualityData.overall_score})`);

    return new Response(JSON.stringify({
      success: true,
      assessment: qualityData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in job-quality-checker:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});