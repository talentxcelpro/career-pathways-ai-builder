// supabase/functions/enhance-resume/index.ts
// Resume Enhancement — Lovable AI (Gemini 2.5 Flash)
// Entitlement-gated: requires authenticated user with resume_tailoring quota remaining.

import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { enforceEntitlement } from '../_shared/entitlement.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Entitlement guard (before body parsing or AI call) ───────────────────
  const access = await enforceEntitlement(req, 'resume_tailoring');
  if (!access.allowed) {
    return new Response(access.errorBody, {
      status: access.httpStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userId = access.userId!;

  try {
    const { action, content, jobDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI backend not configured. Contact support.');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'enhance_section':
        systemPrompt = 'You are a professional resume writer. Enhance the provided resume section to be more impactful, quantifiable, and ATS-friendly. Use strong action verbs and focus on achievements.';
        userPrompt   = `Enhance this resume section:\n\n${content}`;
        break;

      case 'generate_summary':
        systemPrompt = 'You are a professional resume writer. Create a compelling professional summary based on the user\'s experience and skills. Keep it concise (3-4 sentences) and focus on value proposition.';
        userPrompt   = `Based on this resume content, generate a professional summary:\n\n${content}`;
        break;

      case 'optimize_for_job':
        systemPrompt = 'You are an ATS optimisation expert. Tailor the resume content to match the job description by incorporating relevant keywords and highlighting matching experiences. Maintain truthfulness while emphasising relevant qualifications.';
        userPrompt   = `Job Description:\n${jobDescription}\n\nResume Content:\n${content}\n\nOptimise the resume content to better match this job description.`;
        break;

      case 'suggest_bullets':
        systemPrompt = 'You are a professional resume writer. Generate 3-5 impactful bullet points for a job experience. Each bullet should start with a strong action verb, include quantifiable results when possible, and demonstrate impact.';
        userPrompt   = `Generate achievement-focused bullet points for:\n\n${content}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action type.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }

    console.log(`[enhance-resume] user=${userId} tier=${access.tier} action=${action}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const errorText = await response.text();
      console.error('[enhance-resume] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;

    console.log(`[enhance-resume] Complete. user=${userId} action=${action} remaining=${access.remaining}`);

    return new Response(
      JSON.stringify({
        success: true,
        enhanced: enhancedText,
        action,
        entitlement: { tier: access.tier, remaining: access.remaining },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('[enhance-resume] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
