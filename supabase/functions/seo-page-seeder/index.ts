import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PageCombination {
  pageType: string;
  urlPattern: string;
  priority: number;
  estimatedTraffic: number;
}

const generatePageCombinations = async (): Promise<PageCombination[]> => {
  const combinations: PageCombination[] = [];

  try {
    // Fetch SEO data
    const [locationsResult, rolesResult, skillsResult] = await Promise.all([
      supabase.from('seo_locations').select('slug').eq('is_active', true).limit(100),
      supabase.from('seo_roles').select('slug').eq('is_active', true).limit(100),
      supabase.from('seo_skills').select('slug').eq('is_active', true).limit(100)
    ]);

    const locations = locationsResult.data || [];
    const roles = rolesResult.data || [];
    const skills = skillsResult.data || [];

    console.log(`Found ${locations.length} locations, ${roles.length} roles, ${skills.length} skills`);

    // 1. Location-based job pages (High Priority)
    locations.forEach(location => {
      combinations.push({
        pageType: 'job_location',
        urlPattern: `/jobs/location/${location.slug}`,
        priority: 10,
        estimatedTraffic: 5000
      });
    });

    // 2. Role-based job pages (High Priority)
    roles.forEach(role => {
      combinations.push({
        pageType: 'job_role',
        urlPattern: `/jobs/role/${role.slug}`,
        priority: 10,
        estimatedTraffic: 4000
      });
    });

    // 3. Skill-based job pages (Medium Priority)
    skills.forEach(skill => {
      combinations.push({
        pageType: 'job_skill',
        urlPattern: `/jobs/skill/${skill.slug}`,
        priority: 8,
        estimatedTraffic: 2000
      });
    });

    // 4. Role + Location combinations (Very High Priority - top combinations)
    const topRoles = roles.slice(0, 30);
    const topLocations = locations.slice(0, 30);
    
    topRoles.forEach(role => {
      topLocations.forEach(location => {
        combinations.push({
          pageType: 'job_role_location',
          urlPattern: `/jobs/${role.slug}/in/${location.slug}`,
          priority: 15,
          estimatedTraffic: 8000
        });
      });
    });

    // 5. Skill + Location combinations (Medium Priority)
    const topSkills = skills.slice(0, 25);
    topLocations.slice(0, 25).forEach(location => {
      topSkills.forEach(skill => {
        combinations.push({
          pageType: 'skill_location',
          urlPattern: `/jobs/${skill.slug}/jobs/in/${location.slug}`,
          priority: 7,
          estimatedTraffic: 1500
        });
      });
    });

    // 6. Salary guide pages
    roles.forEach(role => {
      combinations.push({
        pageType: 'salary_guide',
        urlPattern: `/salary/${role.slug}`,
        priority: 9,
        estimatedTraffic: 3000
      });
    });

    // 7. Salary guide with location (High Priority)
    topRoles.slice(0, 25).forEach(role => {
      topLocations.slice(0, 25).forEach(location => {
        combinations.push({
          pageType: 'salary_location',
          urlPattern: `/salary/${role.slug}/${location.slug}`,
          priority: 12,
          estimatedTraffic: 6000
        });
      });
    });

    // 8. Industry pages
    const industries = [
      'information-technology', 'financial-services', 'healthcare', 'e-commerce',
      'manufacturing', 'education', 'consulting', 'media-entertainment',
      'telecommunications', 'automotive', 'real-estate', 'retail',
      'energy', 'travel-tourism', 'food-beverage', 'government',
      'non-profit', 'agriculture', 'logistics', 'sports-fitness'
    ];

    industries.forEach(industry => {
      combinations.push({
        pageType: 'industry',
        urlPattern: `/industry/${industry}`,
        priority: 8,
        estimatedTraffic: 2500
      });
    });

    // 9. Companies by location
    locations.slice(0, 50).forEach(location => {
      combinations.push({
        pageType: 'company_location',
        urlPattern: `/companies/location/${location.slug}`,
        priority: 6,
        estimatedTraffic: 1000
      });
    });

    console.log(`Generated ${combinations.length} page combinations`);
    return combinations;

  } catch (error) {
    console.error('Error generating combinations:', error);
    return [];
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'generate' } = await req.json().catch(() => ({ action: 'generate' }));

    console.log(`SEO Page Seeder - Action: ${action}`);

    if (action === 'generate') {
      // Generate all page combinations
      const combinations = await generatePageCombinations();

      // Clear existing combinations
      await supabase.from('seo_page_combinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new combinations in batches
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < combinations.length; i += batchSize) {
        const batch = combinations.slice(i, i + batchSize);
        const { error } = await supabase
          .from('seo_page_combinations')
          .insert(batch.map(combo => ({
            page_type: combo.pageType,
            url_pattern: combo.urlPattern,
            priority: combo.priority,
            estimated_traffic: combo.estimatedTraffic,
            is_generated: false
          })));

        if (error) {
          console.error('Batch insert error:', error);
          throw error;
        }

        insertedCount += batch.length;
        console.log(`Inserted ${insertedCount}/${combinations.length} combinations`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Generated ${combinations.length} SEO page combinations`,
        stats: {
          totalPages: combinations.length,
          highPriority: combinations.filter(c => c.priority >= 10).length,
          mediumPriority: combinations.filter(c => c.priority >= 7 && c.priority < 10).length,
          lowPriority: combinations.filter(c => c.priority < 7).length,
          estimatedTotalTraffic: combinations.reduce((sum, c) => sum + c.estimatedTraffic, 0)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'stats') {
      // Return statistics about existing combinations
      const { data: stats } = await supabase
        .from('seo_page_combinations')
        .select('page_type, priority, estimated_traffic, is_generated');

      const totalCount = stats?.length || 0;
      const generatedCount = stats?.filter(s => s.is_generated).length || 0;
      const totalEstimatedTraffic = stats?.reduce((sum, s) => sum + (s.estimated_traffic || 0), 0) || 0;

      const statsByType = stats?.reduce((acc: any, stat) => {
        if (!acc[stat.page_type]) {
          acc[stat.page_type] = { count: 0, generated: 0, traffic: 0 };
        }
        acc[stat.page_type].count++;
        if (stat.is_generated) acc[stat.page_type].generated++;
        acc[stat.page_type].traffic += stat.estimated_traffic || 0;
        return acc;
      }, {});

      return new Response(JSON.stringify({
        success: true,
        stats: {
          totalPages: totalCount,
          generatedPages: generatedCount,
          pendingPages: totalCount - generatedCount,
          totalEstimatedTraffic,
          completionPercentage: totalCount ? Math.round((generatedCount / totalCount) * 100) : 0,
          pageTypes: statsByType
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action. Use "generate" or "stats"' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seo-page-seeder:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});