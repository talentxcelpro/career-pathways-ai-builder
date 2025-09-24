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

    const { sessionToken, instagramData, action = 'extract' } = await req.json();

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
        // Extract and normalize Instagram creator data
        const extractedData = {
          full_name: instagramData.fullName || '',
          username: instagramData.username || '',
          about: instagramData.bio || '',
          instagram_url: instagramData.profileUrl || '',
          profile_picture_url: instagramData.profilePicture || '',
          followers_count: instagramData.followersCount || 0,
          following_count: instagramData.followingCount || 0,
          posts_count: instagramData.postsCount || 0,
          is_verified: instagramData.isVerified || false,
          is_business_account: instagramData.isBusinessAccount || false,
          is_creator_account: instagramData.isCreatorAccount || false,
          category: instagramData.category || '',
          contact_info: instagramData.contactInfo || {},
          website_url: instagramData.websiteUrl || '',
          recent_posts: instagramData.recentPosts || [],
          story_highlights: instagramData.storyHighlights || [],
          engagement_metrics: instagramData.engagementMetrics || {},
          content_themes: instagramData.contentThemes || [],
          extracted_at: new Date().toISOString(),
          source: 'instagram_extension'
        };

        // Store extracted data
        const { data: extraction, error: extractError } = await supabase
          .from('instagram_extractions')
          .insert({
            user_id: userId,
            raw_data: instagramData,
            extracted_data: extractedData,
            extraction_quality: calculateExtractionQuality(extractedData),
            status: 'completed'
          })
          .select()
          .single();

        if (extractError) {
          console.error('Instagram extraction error:', extractError);
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
        // Sync Instagram data to TalentXcel profile
        const { extractionId, fields } = instagramData;

        const { data: extraction, error: fetchError } = await supabase
          .from('instagram_extractions')
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
        if (fields.includes('instagram_url') && extractedData.instagram_url) {
          updateData.instagram_url = extractedData.instagram_url;
        }
        if (fields.includes('profile_picture') && extractedData.profile_picture_url) {
          updateData.profile_picture_url = extractedData.profile_picture_url;
        }
        if (fields.includes('website') && extractedData.website_url) {
          updateData.website_url = extractedData.website_url;
        }
        if (fields.includes('category') && extractedData.category) {
          updateData.creator_category = extractedData.category;
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

        // Award TXC for Instagram sync
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'instagram_creator_sync',
            metadata: { fields: fields.length }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Creator profile synced successfully',
            updatedFields: Object.keys(updateData)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'portfolio_generation': {
        // Generate professional portfolio from Instagram content
        const { contentSelection, portfolioStyle } = instagramData;

        const portfolioData = {
          user_id: userId,
          platform: 'instagram',
          style: portfolioStyle || 'professional',
          selected_content: contentSelection || [],
          generated_at: new Date().toISOString()
        };

        // Analyze content for professional relevance
        const professionalContent = contentSelection.filter(post => 
          isProfessionalContent(post)
        );

        portfolioData.professional_score = Math.round(
          (professionalContent.length / contentSelection.length) * 100
        );

        // Store portfolio
        const { data: portfolio, error: portfolioError } = await supabase
          .from('creator_portfolios')
          .insert(portfolioData)
          .select()
          .single();

        if (portfolioError) {
          console.error('Portfolio generation error:', portfolioError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to generate portfolio' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            portfolio,
            professionalScore: portfolioData.professional_score,
            selectedContent: professionalContent.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'brand_analysis': {
        // Analyze personal brand from Instagram content
        const { recentPosts, storyHighlights, engagementMetrics } = instagramData;

        const brandAnalysis = {
          content_consistency: calculateContentConsistency(recentPosts),
          engagement_rate: calculateEngagementRate(engagementMetrics),
          brand_themes: extractBrandThemes(recentPosts),
          posting_frequency: calculatePostingFrequency(recentPosts),
          audience_demographics: analyzeAudienceDemographics(engagementMetrics),
          professional_presence_score: calculateProfessionalScore(recentPosts)
        };

        // Store brand analysis
        const { data: analysis, error: analysisError } = await supabase
          .from('brand_analysis')
          .insert({
            user_id: userId,
            platform: 'instagram',
            analysis_data: brandAnalysis,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (analysisError) {
          console.error('Brand analysis error:', analysisError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to analyze brand' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            brandAnalysis,
            analysisId: analysis.id,
            recommendations: generateBrandRecommendations(brandAnalysis)
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
    console.error('Instagram creator sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateExtractionQuality(data: any): number {
  let score = 0;
  const fields = ['full_name', 'username', 'about', 'instagram_url', 'followers_count'];
  
  fields.forEach(field => {
    if (data[field] && (typeof data[field] === 'string' ? data[field].length > 0 : data[field] > 0)) {
      score += 1;
    }
  });
  
  return Math.round((score / fields.length) * 100);
}

function isProfessionalContent(post: any): boolean {
  const professionalKeywords = [
    'work', 'project', 'business', 'professional', 'career', 'skills',
    'learning', 'growth', 'achievement', 'team', 'collaboration'
  ];
  
  const caption = post.caption?.toLowerCase() || '';
  return professionalKeywords.some(keyword => caption.includes(keyword));
}

function calculateContentConsistency(posts: any[]): number {
  if (!posts || posts.length < 2) return 0;
  
  // Simple consistency check based on posting frequency
  const dates = posts.map(post => new Date(post.timestamp)).sort();
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i].getTime() - dates[i-1].getTime());
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
  
  return Math.max(0, 100 - (variance / avgInterval) * 100);
}

function calculateEngagementRate(metrics: any): number {
  if (!metrics || !metrics.totalLikes || !metrics.totalFollowers) return 0;
  return (metrics.totalLikes / metrics.totalFollowers) * 100;
}

function extractBrandThemes(posts: any[]): string[] {
  const themes = new Set<string>();
  const keywords = {
    'lifestyle': ['life', 'daily', 'routine', 'personal'],
    'professional': ['work', 'business', 'career', 'professional'],
    'creative': ['art', 'design', 'creative', 'inspiration'],
    'educational': ['learn', 'teach', 'education', 'knowledge']
  };
  
  posts.forEach(post => {
    const caption = post.caption?.toLowerCase() || '';
    Object.entries(keywords).forEach(([theme, words]) => {
      if (words.some(word => caption.includes(word))) {
        themes.add(theme);
      }
    });
  });
  
  return Array.from(themes);
}

function calculatePostingFrequency(posts: any[]): string {
  if (!posts || posts.length < 2) return 'irregular';
  
  const dates = posts.map(post => new Date(post.timestamp)).sort();
  const daysBetween = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
  const postsPerDay = posts.length / daysBetween;
  
  if (postsPerDay >= 1) return 'daily';
  if (postsPerDay >= 0.5) return 'every_other_day';
  if (postsPerDay >= 0.14) return 'weekly';
  return 'irregular';
}

function analyzeAudienceDemographics(metrics: any): any {
  return {
    engagement_quality: metrics.averageEngagement || 0,
    reach_score: metrics.averageReach || 0,
    audience_growth: metrics.followerGrowthRate || 0
  };
}

function calculateProfessionalScore(posts: any[]): number {
  if (!posts || posts.length === 0) return 0;
  
  const professionalPosts = posts.filter(post => isProfessionalContent(post));
  return Math.round((professionalPosts.length / posts.length) * 100);
}

function generateBrandRecommendations(analysis: any): string[] {
  const recommendations = [];
  
  if (analysis.content_consistency < 50) {
    recommendations.push('Maintain more consistent posting schedule');
  }
  
  if (analysis.engagement_rate < 2) {
    recommendations.push('Focus on creating more engaging content');
  }
  
  if (analysis.professional_presence_score < 30) {
    recommendations.push('Include more professional content to strengthen your personal brand');
  }
  
  return recommendations;
}