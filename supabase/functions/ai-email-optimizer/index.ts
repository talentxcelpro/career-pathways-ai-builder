import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, data } = await req.json();
    console.log('AI Email Optimizer called with operation:', operation);

    switch (operation) {
      case 'optimize_subject_line':
        return await optimizeSubjectLine(data);
      case 'personalize_content':
        return await personalizeContent(data);
      case 'predict_send_time':
        return await predictOptimalSendTime(data);
      case 'generate_ab_variants':
        return await generateABVariants(data);
      case 'analyze_performance':
        return await analyzeEmailPerformance(data);
      case 'predict_engagement':
        return await predictEngagement(data);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error) {
    console.error('Error in AI Email Optimizer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function optimizeSubjectLine(data: any) {
  const { currentSubject, userProfile, emailType, targetAudience } = data;

  const prompt = `As an expert email marketing copywriter, optimize this subject line for maximum open rates:

Current Subject: "${currentSubject}"
Email Type: ${emailType}
Target Audience: ${targetAudience}
User Profile Context: ${JSON.stringify(userProfile)}

Provide 5 optimized subject line variants that:
1. Increase open rates through psychological triggers
2. Maintain relevance to the content
3. Use personalization where appropriate
4. Follow email best practices
5. Are mobile-friendly (under 50 characters)

Return as JSON with this structure:
{
  "variants": [
    {"subject": "...", "strategy": "...", "score": 85},
    ...
  ],
  "analysis": "Why these variants are better",
  "best_practices": ["tip1", "tip2", ...]
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
        { role: 'system', content: 'You are an expert email marketing copywriter specializing in subject line optimization.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const aiResult = await response.json();
  const optimizedData = JSON.parse(aiResult.choices[0].message.content);

  return new Response(JSON.stringify({
    success: true,
    data: optimizedData,
    operation: 'optimize_subject_line'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function personalizeContent(data: any) {
  const { template, userBehavior, userProfile, jobRecommendations } = data;

  const prompt = `Personalize this email template based on user data:

Template: ${template}
User Profile: ${JSON.stringify(userProfile)}
Recent Behavior: ${JSON.stringify(userBehavior)}
Job Recommendations: ${JSON.stringify(jobRecommendations)}

Create a highly personalized version that:
1. Uses the user's name and relevant details naturally
2. References their recent activity/interests
3. Includes relevant job suggestions if applicable
4. Maintains professional tone
5. Includes personalized call-to-actions

Return personalized content with placeholders filled and enhanced messaging.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert at creating personalized email content for career platforms.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.6,
    }),
  });

  const aiResult = await response.json();
  const personalizedContent = aiResult.choices[0].message.content;

  return new Response(JSON.stringify({
    success: true,
    data: { personalizedContent },
    operation: 'personalize_content'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function predictOptimalSendTime(data: any) {
  const { userId, userTimezone, historicalData } = data;

  // Get user's historical engagement data
  const { data: engagementData } = await supabase
    .from('user_behavior_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_type', 'email_open')
    .order('created_at', { ascending: false })
    .limit(100);

  const prompt = `Analyze email engagement patterns and predict optimal send times:

User Timezone: ${userTimezone}
Historical Email Opens: ${JSON.stringify(engagementData?.slice(0, 20))}
Industry Benchmarks: ${JSON.stringify(historicalData)}

Analyze patterns and recommend:
1. Best day of week to send
2. Optimal hour to send
3. Confidence level of prediction
4. Alternative backup times
5. Reasoning behind recommendations

Return as JSON:
{
  "optimal_day": "Tuesday",
  "optimal_hour": 10,
  "confidence": 0.85,
  "backup_times": [{"day": "...", "hour": ...}],
  "reasoning": "...",
  "timezone": "..."
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
        { role: 'system', content: 'You are a data scientist specializing in email timing optimization.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  const aiResult = await response.json();
  const prediction = JSON.parse(aiResult.choices[0].message.content);

  // Store prediction in database
  await supabase
    .from('user_send_time_preferences')
    .upsert({
      user_id: userId,
      preferred_hour: prediction.optimal_hour,
      preferred_day_of_week: getdayNumber(prediction.optimal_day),
      timezone: userTimezone,
      last_updated: new Date().toISOString()
    });

  return new Response(JSON.stringify({
    success: true,
    data: prediction,
    operation: 'predict_send_time'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateABVariants(data: any) {
  const { originalSubject, originalContent, testType, targetMetric } = data;

  const prompt = `Create A/B test variants for email optimization:

Original Subject: "${originalSubject}"
Original Content: "${originalContent}"
Test Type: ${testType}
Target Metric: ${targetMetric}

Generate 2 distinct variants that test different approaches:
- Variant A: Control (minor optimization)
- Variant B: Bold variation (significant change)

Each variant should test a specific hypothesis about what drives ${targetMetric}.

Return as JSON:
{
  "variant_a": {
    "subject": "...",
    "content": "...",
    "hypothesis": "...",
    "changes": ["..."]
  },
  "variant_b": {
    "subject": "...",
    "content": "...",
    "hypothesis": "...",  
    "changes": ["..."]
  },
  "test_duration_days": 7,
  "sample_size_needed": 1000
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
        { role: 'system', content: 'You are an expert in email A/B testing and conversion optimization.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  const aiResult = await response.json();
  const variants = JSON.parse(aiResult.choices[0].message.content);

  return new Response(JSON.stringify({
    success: true,
    data: variants,
    operation: 'generate_ab_variants'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeEmailPerformance(data: any) {
  const { campaignId, metrics, industryBenchmarks } = data;

  const prompt = `Analyze email campaign performance and provide insights:

Campaign Metrics:
- Open Rate: ${metrics.openRate}%
- Click Rate: ${metrics.clickRate}%
- Conversion Rate: ${metrics.conversionRate}%
- Unsubscribe Rate: ${metrics.unsubscribeRate}%
- Total Sent: ${metrics.totalSent}

Industry Benchmarks:
- Open Rate: ${industryBenchmarks.openRate}%
- Click Rate: ${industryBenchmarks.clickRate}%
- Conversion Rate: ${industryBenchmarks.conversionRate}%

Provide analysis including:
1. Performance vs benchmarks
2. Key strengths and weaknesses
3. Specific optimization recommendations
4. Predicted impact of improvements

Return as JSON:
{
  "performance_grade": "B+",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": [
    {"area": "subject_line", "suggestion": "...", "impact": "high"},
    ...
  ],
  "next_actions": ["..."]
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
        { role: 'system', content: 'You are an email marketing analyst with expertise in performance optimization.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.4,
    }),
  });

  const aiResult = await response.json();
  const analysis = JSON.parse(aiResult.choices[0].message.content);

  return new Response(JSON.stringify({
    success: true,
    data: analysis,
    operation: 'analyze_performance'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function predictEngagement(data: any) {
  const { userId, emailContent, userProfile, sendTime } = data;

  // Get user's recent behavior
  const { data: recentBehavior } = await supabase
    .from('user_behavior_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const prompt = `Predict email engagement likelihood for this user:

User Profile: ${JSON.stringify(userProfile)}
Recent Behavior (30 days): ${JSON.stringify(recentBehavior?.slice(0, 10))}
Email Content Preview: "${emailContent.substring(0, 500)}..."
Planned Send Time: ${sendTime}

Predict and analyze:
1. Likelihood to open (0-100%)
2. Likelihood to click (0-100%)
3. Likelihood to convert (0-100%)
4. Risk factors that might reduce engagement
5. Opportunities to improve engagement

Return as JSON:
{
  "open_probability": 75,
  "click_probability": 25,
  "conversion_probability": 8,
  "engagement_score": 68,
  "risk_factors": ["..."],
  "opportunities": ["..."],
  "confidence": 0.82
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
        { role: 'system', content: 'You are a predictive analytics expert for email engagement.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  const aiResult = await response.json();
  const prediction = JSON.parse(aiResult.choices[0].message.content);

  // Store prediction for tracking accuracy
  await supabase
    .from('user_predictions')
    .insert({
      user_id: userId,
      prediction_type: 'email_engagement',
      prediction_value: prediction.engagement_score,
      confidence_score: prediction.confidence,
      factors: prediction,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  return new Response(JSON.stringify({
    success: true,
    data: prediction,
    operation: 'predict_engagement'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getdayNumber(dayName: string): number {
  const days = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  return days[dayName as keyof typeof days] || 1;
}