import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartSuggestion {
  id: string;
  type: 'achievement' | 'keyword' | 'formatting' | 'skill' | 'education';
  priority: 'critical' | 'high' | 'medium' | 'low';
  section: string;
  current: string;
  suggested: string;
  reason: string;
  impact: string;
  actionable: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, targetRole, industry, marketTrends } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating smart suggestions for:', targetRole || 'general role');

    const systemPrompt = `You are an expert career coach and resume optimization specialist. Analyze the resume and provide specific, actionable suggestions that will significantly improve its impact.

**FOCUS AREAS:**

1. **Achievement Quantification**
   - Identify statements that lack metrics
   - Suggest specific ways to add numbers, percentages, or measurable outcomes
   - Transform passive descriptions into quantified achievements

2. **Keyword Optimization**
   - Identify missing industry-standard keywords for ${targetRole || 'the role'} in ${industry || 'the field'}
   - Suggest natural places to integrate keywords
   - Avoid keyword stuffing - maintain readability

3. **Skill Gap Analysis**
   - Compare current skills against ${targetRole || 'target role'} requirements
   - Identify high-demand skills that are missing
   - Suggest relevant skills based on experience

4. **Formatting & Structure**
   - Identify inconsistencies in date formats, bullet points, etc.
   - Suggest improvements to section ordering
   - Recommend additions (e.g., certifications, projects)

5. **Content Enhancement**
   - Strengthen weak action verbs
   - Improve summary impact
   - Suggest ways to better highlight unique value proposition

${marketTrends ? `6. **Market Alignment**\nTrends: ${JSON.stringify(marketTrends)}\nAlign suggestions with current market demands` : ''}

**RETURN FORMAT:**
For each suggestion, provide:
- Specific current text or section
- Concrete suggested improvement
- Clear reason for the change
- Expected impact on ATS/recruiter perception
- Priority level

Return as JSON array of suggestion objects.`;

    const resumeText = buildResumeAnalysisText(resumeData);

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
          { role: 'user', content: `Analyze and provide actionable suggestions:\n\n${resumeText}` }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestionsText = data.choices[0].message.content;
    
    let suggestions: SmartSuggestion[];
    try {
      const jsonMatch = suggestionsText.match(/```json\n([\s\S]*?)\n```/) || 
                        suggestionsText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : suggestionsText;
      suggestions = JSON.parse(jsonStr);
      
      // Add IDs if missing
      suggestions = suggestions.map((s, idx) => ({
        ...s,
        id: s.id || `suggestion_${idx}`,
        actionable: s.actionable !== false
      }));
    } catch (e) {
      console.error('Failed to parse suggestions:', suggestionsText);
      suggestions = generateBasicSuggestions(resumeData);
    }

    console.log(`✅ Generated ${suggestions.length} smart suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        suggestions,
        count: suggestions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smart-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildResumeAnalysisText(resumeData: any): string {
  const parts: string[] = [];

  if (resumeData.personalInfo?.summary) {
    parts.push(`SUMMARY: ${resumeData.personalInfo.summary}`);
  }

  if (resumeData.experience?.length > 0) {
    parts.push(`\nEXPERIENCE:`);
    resumeData.experience.forEach((exp: any) => {
      parts.push(`\n${exp.title} at ${exp.company}`);
      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          parts.push(`  • ${achievement}`);
        });
      } else if (exp.description) {
        parts.push(`  ${exp.description}`);
      }
    });
  }

  if (resumeData.skills?.length > 0) {
    const skillNames = resumeData.skills.map((s: any) => 
      typeof s === 'string' ? s : s.name
    );
    parts.push(`\nSKILLS: ${skillNames.join(', ')}`);
  }

  if (resumeData.education?.length > 0) {
    parts.push(`\nEDUCATION:`);
    resumeData.education.forEach((edu: any) => {
      parts.push(`  ${edu.degree} - ${edu.institution}`);
    });
  }

  return parts.join('\n');
}

function generateBasicSuggestions(resumeData: any): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  let id = 0;

  // Check for summary
  if (!resumeData.personalInfo?.summary || resumeData.personalInfo.summary.length < 50) {
    suggestions.push({
      id: `suggestion_${id++}`,
      type: 'formatting',
      priority: 'high',
      section: 'summary',
      current: resumeData.personalInfo?.summary || 'Missing',
      suggested: 'Add a compelling 3-4 sentence professional summary highlighting your key achievements and skills',
      reason: 'Professional summary is crucial for first impression and ATS optimization',
      impact: 'Significantly improves recruiter engagement',
      actionable: true
    });
  }

  // Check for quantified achievements
  if (resumeData.experience?.length > 0) {
    resumeData.experience.forEach((exp: any, index: number) => {
      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((achievement: string, achIndex: number) => {
          if (!/\d+/.test(achievement)) {
            suggestions.push({
              id: `suggestion_${id++}`,
              type: 'achievement',
              priority: 'high',
              section: `experience[${index}].achievements[${achIndex}]`,
              current: achievement,
              suggested: achievement.replace(/\.$/, '') + ' (Add specific metrics: numbers, percentages, or measurable outcomes)',
              reason: 'Quantified achievements are more impactful and credible',
              impact: 'Increases perceived value by 40-60%',
              actionable: true
            });
          }
        });
      }
    });
  }

  // Check for skills
  if (!resumeData.skills || resumeData.skills.length < 5) {
    suggestions.push({
      id: `suggestion_${id++}`,
      type: 'skill',
      priority: 'medium',
      section: 'skills',
      current: `${resumeData.skills?.length || 0} skills listed`,
      suggested: 'Add 8-12 relevant technical and professional skills',
      reason: 'Skills section is crucial for ATS keyword matching',
      impact: 'Improves ATS score by 20-30%',
      actionable: true
    });
  }

  return suggestions;
}
