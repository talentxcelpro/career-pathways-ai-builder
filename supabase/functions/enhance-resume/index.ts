import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, jobDescription } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Different prompts based on action type
    switch (action) {
      case "enhance_section":
        systemPrompt = "You are a professional resume writer. Enhance the provided resume section to be more impactful, quantifiable, and ATS-friendly. Use strong action verbs and focus on achievements.";
        userPrompt = `Enhance this resume section:\n\n${content}`;
        break;
      
      case "generate_summary":
        systemPrompt = "You are a professional resume writer. Create a compelling professional summary based on the user's experience and skills. Keep it concise (3-4 sentences) and focus on value proposition.";
        userPrompt = `Based on this resume content, generate a professional summary:\n\n${content}`;
        break;
      
      case "optimize_for_job":
        systemPrompt = "You are an ATS optimization expert. Tailor the resume content to match the job description by incorporating relevant keywords and highlighting matching experiences. Maintain truthfulness while emphasizing relevant qualifications.";
        userPrompt = `Job Description:\n${jobDescription}\n\nResume Content:\n${content}\n\nOptimize the resume content to better match this job description.`;
        break;
      
      case "suggest_bullets":
        systemPrompt = "You are a professional resume writer. Generate 3-5 impactful bullet points for a job experience. Each bullet should start with a strong action verb, include quantifiable results when possible, and demonstrate impact.";
        userPrompt = `Generate achievement-focused bullet points for:\n\n${content}`;
        break;
      
      default:
        throw new Error("Invalid action type");
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;

    console.log(`Successfully enhanced resume content for action: ${action}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        enhanced: enhancedText,
        action 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in enhance-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
