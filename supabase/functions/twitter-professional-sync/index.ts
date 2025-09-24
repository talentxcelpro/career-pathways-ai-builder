import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, twitterData, action = 'extract' } = await req.json();

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
      case 'extract': {
        // Extract and normalize Twitter professional data
        const extractedData = {
          full_name: twitterData.displayName || '',
          about: twitterData.bio || '',
          location: twitterData.location || '',
          twitter_url: twitterData.profileUrl || '',
          profile_picture_url: twitterData.profileImageUrl || '',
          banner_picture_url: twitterData.bannerImageUrl || '',
          followers_count: twitterData.followersCount || 0,
          following_count: twitterData.followingCount || 0,
          tweets_count: twitterData.tweetsCount || 0,
          verified: twitterData.verified || false,
          professional_account: twitterData.professionalAccount || false,
          website_url: twitterData.websiteUrl || '',
          interests: twitterData.interests || [],
          recent_tweets: twitterData.recentTweets || [],
          engagement_metrics: twitterData.engagementMetrics || {},
          extracted_at: new Date().toISOString(),
          source: 'twitter_extension'
        };

        // Store extracted data
        const { data: extraction, error: extractError } = await supabase
          .from('twitter_extractions')
          .insert({
            user_id: userId,
            raw_data: twitterData,
            extracted_data: extractedData,
            extraction_quality: calculateExtractionQuality(extractedData),
            status: 'completed'
          })
          .select()
          .single();

        if (extractError) {
          console.error('Twitter extraction error:', extractError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to store extraction' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            extractedData,
            extractionId: extraction.id,
            quality: extraction.extraction_quality
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        // Sync Twitter data to TalentXcel profile
        const { extractionId, fields } = twitterData;

        const { data: extraction, error: fetchError } = await supabase
          .from('twitter_extractions')
          .select('extracted_data')
          .eq('id', extractionId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !extraction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Extraction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData: any = {};
        const extractedData = extraction.extracted_data;

        // Map selected fields to profile fields
        if (fields.includes('name') && extractedData.full_name) {
          updateData.full_name = extractedData.full_name;
        }
        if (fields.includes('about') && extractedData.about) {
          updateData.about = extractedData.about;
        }
        if (fields.includes('location') && extractedData.location) {
          updateData.location = extractedData.location;
        }
        if (fields.includes('twitter_url') && extractedData.twitter_url) {
          updateData.twitter_url = extractedData.twitter_url;
        }
        if (fields.includes('profile_picture') && extractedData.profile_picture_url) {
          updateData.profile_picture_url = extractedData.profile_picture_url;
        }
        if (fields.includes('banner_picture') && extractedData.banner_picture_url) {
          updateData.banner_picture_url = extractedData.banner_picture_url;
        }
        if (fields.includes('website') && extractedData.website_url) {
          updateData.website_url = extractedData.website_url;
        }

        updateData.updated_at = new Date().toISOString();

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('Profile update error:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award TXC for Twitter sync
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'twitter_profile_sync',
            metadata: { fields: fields.length }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Profile synced successfully',
            updatedFields: Object.keys(updateData)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'content_suggestions': {
        // Generate professional content suggestions based on Twitter activity
        const { profileData, careerGoals } = twitterData;

        const suggestions = generateContentSuggestions(profileData, careerGoals);

        // Store content suggestions
        const { data: contentPlan, error: planError } = await supabase
          .from('content_suggestions')
          .insert({
            user_id: userId,
            platform: 'twitter',
            suggestions,
            career_goals: careerGoals,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (planError) {
          console.error('Content suggestions error:', planError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to generate content suggestions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            suggestions,
            contentPlanId: contentPlan.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'network_analysis': {
        // Analyze Twitter network for professional opportunities
        const { followingList, followersList, interactions } = twitterData;

        const networkAnalysis = {
          professional_connections: 0,
          industry_leaders: [],
          potential_mentors: [],
          networking_opportunities: [],
          engagement_quality: 0
        };

        // Analyze following list for professional connections
        if (followingList) {
          networkAnalysis.professional_connections = followingList.filter(
            user => user.verified || user.professionalAccount
          ).length;

          networkAnalysis.industry_leaders = followingList
            .filter(user => user.followersCount > 10000 && user.verified)
            .slice(0, 10);
        }

        // Store network analysis
        const { data: analysis, error: analysisError } = await supabase
          .from('network_analysis')
          .insert({
            user_id: userId,
            platform: 'twitter',
            analysis_data: networkAnalysis,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (analysisError) {
          console.error('Network analysis error:', analysisError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to analyze network' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            networkAnalysis,
            analysisId: analysis.id
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
    console.error('Twitter professional sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateExtractionQuality(data: any): number {
  let score = 0;
  const fields = ['full_name', 'about', 'location', 'twitter_url', 'followers_count'];
  
  fields.forEach(field => {
    if (data[field] && (typeof data[field] === 'string' ? data[field].length > 0 : data[field] > 0)) {
      score += 1;
    }
  });
  
  return Math.round((score / fields.length) * 100);
}

function generateContentSuggestions(profileData: any, careerGoals: any) {
  const suggestions = [];

  // Industry insights
  suggestions.push({
    type: 'industry_insight',
    title: 'Share Industry Insights',
    content: 'Share your thoughts on the latest trends in your industry. Your followers value expert perspectives.',
    hashtags: ['#IndustryTrends', '#ProfessionalGrowth', '#Insights']
  });

  // Career milestones
  suggestions.push({
    type: 'milestone',
    title: 'Celebrate Achievements',
    content: 'Share your recent professional achievements and what you learned from them.',
    hashtags: ['#CareerGrowth', '#Achievement', '#Learning']
  });

  // Thought leadership
  suggestions.push({
    type: 'thought_leadership',
    title: 'Thought Leadership',
    content: 'Share your unique perspective on challenges in your field and potential solutions.',
    hashtags: ['#ThoughtLeadership', '#Innovation', '#ProblemSolving']
  });

  return suggestions;
}