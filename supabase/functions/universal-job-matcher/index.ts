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

    const { sessionToken, jobData, userProfile, action = 'analyze' } = await req.json();

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

    switch (action) {
      case 'analyze': {
        // AI-powered job matching analysis
        const matchAnalysis = await analyzeJobMatch(jobData, userProfile);
        
        // Store match analysis
        const { data: jobMatch, error: matchError } = await supabase
          .from('ai_job_matches')
          .insert({
            user_id: userId,
            job_id: jobData.id || null,
            match_score: matchAnalysis.overallScore,
            matching_factors: matchAnalysis.matchingFactors,
            skill_gaps: matchAnalysis.skillGaps,
            salary_comparison: matchAnalysis.salaryComparison,
            metadata: {
              job_title: jobData.title,
              company: jobData.company,
              platform: jobData.platform || 'external',
              analysis_version: 'v2.0'
            }
          })
          .select()
          .single();

        if (matchError) {
          console.error('Job match storage error:', matchError);
        }

        // Award TXC for job analysis
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'ai_feature_usage',
            sessionToken,
            metadata: { feature: 'job_matching', match_score: matchAnalysis.overallScore }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            matchId: jobMatch?.id,
            analysis: matchAnalysis,
            recommendations: generateApplicationRecommendations(matchAnalysis)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'batch_analyze': {
        // Analyze multiple jobs at once
        const { jobs } = jobData;
        const analyses = [];

        for (const job of jobs.slice(0, 10)) { // Limit to 10 jobs to prevent timeout
          try {
            const analysis = await analyzeJobMatch(job, userProfile);
            analyses.push({
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              matchScore: analysis.overallScore,
              topFactors: analysis.matchingFactors.slice(0, 3),
              criticalGaps: analysis.skillGaps.filter((gap: any) => gap.importance === 'critical')
            });
          } catch (error) {
            console.error(`Failed to analyze job ${job.id}:`, error);
          }
        }

        // Sort by match score
        analyses.sort((a, b) => b.matchScore - a.matchScore);

        return new Response(
          JSON.stringify({
            success: true,
            batchAnalysis: analyses,
            totalAnalyzed: analyses.length,
            bestMatches: analyses.slice(0, 5)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_application': {
        // Track job application from extension
        const { jobId, applicationData } = jobData;

        const { data: application, error: appError } = await supabase
          .from('job_applications')
          .insert({
            job_id: jobId,
            user_id: userId,
            application_data: applicationData,
            source: 'chrome_extension',
            status: 'submitted'
          })
          .select()
          .single();

        if (appError) {
          console.error('Application tracking error:', appError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to track application' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award TXC for job application
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'job_application_assist',
            sessionToken,
            metadata: { job_title: applicationData.jobTitle, platform: applicationData.platform }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            applicationId: application.id,
            message: 'Job application tracked successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Universal job matcher error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeJobMatch(jobData: any, userProfile: any) {
  const systemPrompt = `You are an expert career counselor and job matching AI. Analyze the compatibility between a job posting and a candidate profile.

Provide a comprehensive analysis in this exact JSON format:
{
  "overallScore": number (0-100),
  "matchingFactors": [
    {
      "factor": "string",
      "strength": "high|medium|low",
      "description": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "importance": "critical|important|nice-to-have",
      "suggestion": "string"
    }
  ],
  "salaryComparison": {
    "jobSalary": "string",
    "marketRate": "string",
    "assessment": "above|at|below market"
  },
  "strengthAreas": ["string"],
  "improvementAreas": ["string"],
  "applicationStrategy": "string",
  "confidenceLevel": "high|medium|low"
}`;

  const userPrompt = `
Job Posting:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
Required Skills: ${jobData.skills?.join(', ') || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}
Location: ${jobData.location || 'Not specified'}
Salary: ${jobData.salary || 'Not specified'}

Candidate Profile:
Name: ${userProfile.full_name}
Title: ${userProfile.title}
Experience: ${userProfile.experience_level}
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
Location: ${userProfile.location}
About: ${userProfile.about}

Please analyze the job-candidate fit comprehensively.
  `;

  try {
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
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    const aiData = await response.json();
    
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response');
    }

    return JSON.parse(aiData.choices[0].message.content);
  } catch (error) {
    console.error('AI analysis error:', error);
    // Return fallback analysis
    return {
      overallScore: 60,
      matchingFactors: [{ factor: "Basic compatibility", strength: "medium", description: "Profile shows general alignment with role requirements" }],
      skillGaps: [],
      salaryComparison: { jobSalary: "Not specified", marketRate: "Unknown", assessment: "unknown" },
      strengthAreas: ["Professional experience"],
      improvementAreas: ["Skill development"],
      applicationStrategy: "Standard application approach recommended",
      confidenceLevel: "medium"
    };
  }
}

function generateApplicationRecommendations(analysis: any): any {
  const recommendations = {
    priority: analysis.overallScore >= 80 ? 'high' : analysis.overallScore >= 60 ? 'medium' : 'low',
    actions: [],
    timeline: 'immediate'
  };

  if (analysis.overallScore >= 80) {
    recommendations.actions = [
      'Apply immediately - excellent match!',
      'Highlight your strongest matching factors in your application',
      'Prepare for interview with confidence'
    ] as any;
  } else if (analysis.overallScore >= 60) {
    recommendations.actions = [
      'Apply with targeted improvements',
      'Address skill gaps in your cover letter',
      'Research the company thoroughly'
    ] as any;
  } else {
    recommendations.actions = [
      'Consider developing missing skills first',
      'Look for similar roles with better fit',
      'Network with company employees for insights'
    ] as any;
    recommendations.timeline = 'after_preparation';
  }

  return recommendations;
}