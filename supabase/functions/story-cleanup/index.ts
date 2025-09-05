import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting story cleanup process...');

    // Clean up expired stories (older than 24 hours)
    const { data: expiredStories, error: fetchError } = await supabaseClient
      .from('stories')
      .select('id')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired stories:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredStories?.length || 0} expired stories`);

    if (expiredStories && expiredStories.length > 0) {
      // Mark expired stories as inactive
      const { error: updateError } = await supabaseClient
        .from('stories')
        .update({ is_active: false })
        .in('id', expiredStories.map(s => s.id));

      if (updateError) {
        console.error('Error updating expired stories:', updateError);
        throw updateError;
      }

      console.log(`Successfully deactivated ${expiredStories.length} expired stories`);
    }

    // Optional: Clean up old story views (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: viewCleanupError } = await supabaseClient
      .from('story_views')
      .delete()
      .lt('viewed_at', thirtyDaysAgo.toISOString());

    if (viewCleanupError) {
      console.error('Error cleaning up old story views:', viewCleanupError);
      // Don't throw here as this is optional cleanup
    } else {
      console.log('Successfully cleaned up old story views');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${expiredStories?.length || 0} expired stories`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Story cleanup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});