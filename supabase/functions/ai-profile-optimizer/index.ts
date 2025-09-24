import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, profileData, platform = 'linkedin', optimizationType = 'general' } = await req.json();

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('chrome_extension_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user_id;

    // Get user's current profile for context
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Prepare AI optimization prompt based on platform and type
    const systemPrompt = generateOptimizationPrompt(platform, optimizationType);
    const userPrompt = `
Profile to optimize:
${JSON.stringify(profileData, null, 2)}

Current user context:
- Industry: ${userProfile?.industry || 'Not specified'}
- Experience Level: ${userProfile?.experience_level || 'Not specified'}
- Target Role: ${userProfile?.target_role || 'Not specified'}
- Location: ${userProfile?.location || 'Not specified'}

Please provide specific, actionable optimization suggestions.
    `;

    // Call OpenAI for optimization suggestions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const aiData = await response.json();
    
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response');
    }

    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Store optimization results
    const { data: optimization, error: optimizationError } = await supabase
      .from('ai_profile_optimizations')
      .insert({
        user_id: userId,
        platform,
        optimization_type: optimizationType,
        original_profile: profileData,
        suggestions,
        ai_model: 'gpt-4o-mini',
        quality_score: calculateOptimizationQuality(suggestions),
        status: 'completed'
      })
      .select()
      .single();

    if (optimizationError) {
      console.error('Optimization storage error:', optimizationError);
    }

    // Award TXC for using AI optimization
    await supabase.functions.invoke('extension-txc-miner', {
      body: {
        userId,
        activity: 'profile_optimization',
        sessionToken,
        metadata: { platform, optimization_type: optimizationType }
      }
    });

    // Generate implementation priority
    const prioritizedSuggestions = prioritizeSuggestions(suggestions);

    return new Response(
      JSON.stringify({
        success: true,
        optimizationId: optimization?.id,
        suggestions: prioritizedSuggestions,
        platform,
        optimizationType,
        qualityScore: optimization?.quality_score,
        implementationTips: generateImplementationTips(platform)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI profile optimizer error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate optimization suggestions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateOptimizationPrompt(platform: string, type: string): string {
  const platformSpecific = {
    linkedin: `
You are an expert LinkedIn profile optimization consultant. Analyze the profile and provide specific suggestions to improve:
- Professional headline impact
- Summary engagement and keyword optimization
- Experience descriptions for ATS and recruiter appeal
- Skills section completeness and relevance
- Overall profile discoverability
`,
    naukri: `
You are an expert Naukri.com profile optimization consultant. Focus on:
- Profile title optimization for Indian job market
- Summary tailored for Indian recruiters
- Skills matching common Indian industry requirements
- Experience highlighting achievements and growth
- Resume headline effectiveness
`,
    twitter: `
You are a professional Twitter/X optimization expert. Optimize for:
- Bio clarity and professional appeal
- Content strategy alignment
- Thought leadership positioning
- Networking opportunities
- Professional brand consistency
`
  };

  const typeSpecific = {
    general: 'Provide comprehensive optimization across all profile sections.',
    ats: 'Focus specifically on ATS (Applicant Tracking System) optimization with keyword suggestions.',
    networking: 'Optimize for networking and connection-building opportunities.',
    visibility: 'Enhance profile visibility and discoverability in searches.',
    conversion: 'Optimize for converting profile views into meaningful connections or opportunities.'
  };

  return `${platformSpecific[platform] || platformSpecific.linkedin}

${typeSpecific[type] || typeSpecific.general}

IMPORTANT: Respond with a valid JSON object in this exact format:
{
  "overallScore": number (1-100),
  "suggestions": [
    {
      "section": "string (headline, summary, experience, skills, etc.)",
      "priority": "string (high, medium, low)",
      "issue": "string (what needs improvement)",
      "recommendation": "string (specific action to take)",
      "impact": "string (expected outcome)",
      "keywords": ["string"] (relevant keywords to include),
      "examples": ["string"] (example text or phrases)
    }
  ],
  "quickWins": ["string"] (3-5 immediate improvements),
  "keywordGaps": ["string"] (missing important keywords),
  "competitiveAdvantage": "string" (unique positioning suggestion)
}`;
}

function calculateOptimizationQuality(suggestions: any): number {
  let score = 0;
  
  // Score based on number and quality of suggestions
  if (suggestions.suggestions?.length >= 5) score += 30;
  if (suggestions.quickWins?.length >= 3) score += 20;
  if (suggestions.keywordGaps?.length > 0) score += 25;
  if (suggestions.competitiveAdvantage) score += 25;
  
  return Math.min(score, 100);
}

function prioritizeSuggestions(suggestions: any) {
  if (!suggestions.suggestions) return suggestions;
  
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  
  suggestions.suggestions.sort((a: any, b: any) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return suggestions;
}

function generateImplementationTips(platform: string): string[] {
  const tips = {
    linkedin: [
      "Update your headline first - it's the most visible element",
      "Use industry keywords naturally in your summary",
      "Add quantifiable achievements to experience sections",
      "Request recommendations from recent colleagues",
      "Update your status regularly to stay active"
    ],
    naukri: [
      "Keep your resume headline clear and role-specific",
      "Update salary expectations to current market rates",
      "Add all relevant skills to increase searchability",
      "Keep profile 100% complete for better visibility",
      "Update regularly to appear in fresh searches"
    ],
    twitter: [
      "Pin your best professional tweet",
      "Use consistent professional headshots across platforms",
      "Engage with industry thought leaders regularly",
      "Share industry insights and commentary",
      "Use relevant hashtags in your niche"
    ]
  };
  
  return tips[platform] || tips.linkedin;
}