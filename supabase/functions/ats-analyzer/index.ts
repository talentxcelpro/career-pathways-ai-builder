// supabase/functions/ats-analyzer/index.ts
// ATS Resume Analyzer — Gemini 1.5 Flash with Lovable AI fallback
// Entitlement-gated: requires authenticated user with ats_check quota remaining.

import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { enforceEntitlement } from '../_shared/entitlement.ts';

interface ATSAnalysisResult {
  score: number;
  keywordScore: number;
  formatScore: number;
  contentScore: number;
  strengthsFound: string[];
  issuesFound: string[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Entitlement guard (must run BEFORE parsing body or making AI calls) ───
  const access = await enforceEntitlement(req, 'ats_check');
  if (!access.allowed) {
    return new Response(access.errorBody, {
      status: access.httpStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  // access.userId is the verified user ID — use this, not any client-supplied value
  const userId = access.userId!;

  try {
    const { resumeData, jobDescription } = await req.json();

    const GEMINI_API_KEY  = Deno.env.get('GEMINI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error('AI backend not configured. Contact support.');
    }

    const resumeText = buildResumeText(resumeData);

    const systemPrompt = `You are an ATS (Applicant Tracking System) expert analyzer. Analyze resumes for:
1. ATS compatibility (formatting, keywords, structure)
2. Content quality (achievements, metrics, impact)
3. Keyword optimization
4. Professional standards

Return analysis in this JSON format:
{
  "score": <0-100>,
  "keywordScore": <0-100>,
  "formatScore": <0-100>,
  "contentScore": <0-100>,
  "strengthsFound": ["strength1", "strength2", ...],
  "issuesFound": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "matchedKeywords": ["keyword1", ...],
  "missingKeywords": ["keyword1", ...]
}`;

    let userPrompt = `Analyze this resume:\n\n${resumeText}`;
    if (jobDescription) {
      userPrompt += `\n\nTarget Job Description:\n${jobDescription}\n\nProvide job-specific keyword analysis.`;
    }

    let analysisText = '';

    if (GEMINI_API_KEY) {
      console.log(`[ats-analyzer] user=${userId} tier=${access.tier} — Gemini 1.5 Flash`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }, { text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ats-analyzer] Gemini error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    } else {
      console.log(`[ats-analyzer] user=${userId} tier=${access.tier} — Lovable AI fallback`);
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
          temperature: 0.3,
          response_format: { type: 'json_object' },
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
        console.error('[ats-analyzer] Lovable AI error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      analysisText = data.choices[0].message.content;
    }

    let analysis: ATSAnalysisResult;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error('[ats-analyzer] Failed to parse AI response:', analysisText.slice(0, 200));
      throw new Error('Invalid AI response format. Please try again.');
    }

    console.log(`[ats-analyzer] Complete. user=${userId} score=${analysis.score}/100 remaining=${access.remaining}`);

    return new Response(
      JSON.stringify({
        success:   true,
        analysis,
        entitlement: {
          tier:      access.tier,
          remaining: access.remaining,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('[ats-analyzer] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error:   error instanceof Error ? error.message : 'An unexpected error occurred.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

function buildResumeText(resumeData: Record<string, unknown>): string {
  const sections: string[] = [];

  const pi = resumeData.personalInfo as Record<string, string> | undefined;
  if (pi) {
    sections.push('CONTACT INFORMATION');
    sections.push(`Name: ${pi.fullName ?? 'N/A'}`);
    sections.push(`Email: ${pi.email ?? 'N/A'}`);
    sections.push(`Phone: ${pi.phone ?? 'N/A'}`);
    sections.push(`Location: ${pi.location ?? 'N/A'}`);
    if (pi.summary) sections.push(`\nPROFESSIONAL SUMMARY\n${pi.summary}`);
  }

  const experience = resumeData.experience as Array<Record<string, unknown>> | undefined;
  if (experience?.length) {
    sections.push('\nWORK EXPERIENCE');
    for (const exp of experience) {
      sections.push(`\n${exp.title} at ${exp.company}`);
      sections.push(`${exp.startDate} - ${exp.endDate ?? 'Present'}`);
      if (exp.description) sections.push(`${exp.description}`);
    }
  }

  const education = resumeData.education as Array<Record<string, unknown>> | undefined;
  if (education?.length) {
    sections.push('\nEDUCATION');
    for (const edu of education) {
      sections.push(`\n${edu.degree} - ${edu.institution}`);
      sections.push(`${edu.startDate} - ${edu.endDate ?? 'Present'}`);
    }
  }

  const skills = resumeData.skills as unknown[] | undefined;
  if (skills?.length) {
    const skillNames = skills.map((s) =>
      typeof s === 'string' ? s : (s as Record<string, string>).name ?? '',
    ).filter(Boolean);
    if (skillNames.length) {
      sections.push('\nSKILLS');
      sections.push(skillNames.join(', '));
    }
  }

  return sections.join('\n');
}
