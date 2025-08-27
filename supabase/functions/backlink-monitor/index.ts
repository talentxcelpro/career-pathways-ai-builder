import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MonitorRequest {
  backlink_ids?: string[];
  check_all?: boolean;
  max_check?: number;
}

const checkBacklink = async (backlink: any): Promise<{ status: string; is_dofollow?: boolean; notes?: string }> => {
  try {
    console.log(`Checking backlink: ${backlink.source_url}`);
    
    const response = await fetch(backlink.source_url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TalentXcel-Bot/1.0; +https://talentxcel.in/bot)'
      }
    });

    if (!response.ok) {
      return {
        status: 'broken',
        notes: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const html = await response.text();
    
    // Check if target URL exists in the page
    const targetExists = html.includes(backlink.target_url) || 
                        html.includes('talentxcel.in') ||
                        html.includes('TalentXcel');

    if (!targetExists) {
      return {
        status: 'removed',
        notes: 'Target URL not found in source page'
      };
    }

    // Check if link is dofollow
    const linkPattern = new RegExp(`<a[^>]*href=["']([^"']*${backlink.target_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*)["'][^>]*>`, 'i');
    const linkMatch = html.match(linkPattern);
    
    let is_dofollow = true;
    if (linkMatch) {
      const linkTag = linkMatch[0];
      is_dofollow = !linkTag.includes('rel="nofollow"') && !linkTag.includes("rel='nofollow'");
    }

    return {
      status: 'live',
      is_dofollow,
      notes: 'Backlink verified and active'
    };

  } catch (error) {
    console.error(`Error checking backlink ${backlink.source_url}:`, error);
    return {
      status: 'broken',
      notes: `Check failed: ${error.message}`
    };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { backlink_ids = [], check_all = false, max_check = 50 }: MonitorRequest = await req.json();
    
    console.log('Starting backlink monitoring:', { backlink_ids: backlink_ids.length, check_all, max_check });

    let query = supabase
      .from('backlinks')
      .select('*');

    if (check_all) {
      // Check backlinks that haven't been checked recently or are pending
      query = query
        .or('last_checked_at.is.null,last_checked_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('last_checked_at', { ascending: true, nullsFirst: true })
        .limit(max_check);
    } else if (backlink_ids.length > 0) {
      query = query.in('id', backlink_ids);
    } else {
      throw new Error('Either provide backlink_ids or set check_all to true');
    }

    const { data: backlinks, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch backlinks: ${error.message}`);
    }

    if (!backlinks || backlinks.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No backlinks to check',
        checked: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    let liveCount = 0;
    let brokenCount = 0;
    let removedCount = 0;

    for (const backlink of backlinks) {
      try {
        const checkResult = await checkBacklink(backlink);
        
        // Update backlink status
        const updateData: any = {
          status: checkResult.status,
          last_checked_at: new Date().toISOString(),
          notes: checkResult.notes
        };

        if (checkResult.is_dofollow !== undefined) {
          updateData.is_dofollow = checkResult.is_dofollow;
        }

        if (checkResult.status === 'broken' && backlink.status !== 'broken') {
          updateData.broken_since = new Date().toISOString();
        } else if (checkResult.status === 'live' && backlink.status === 'broken') {
          updateData.broken_since = null;
        }

        await supabase
          .from('backlinks')
          .update(updateData)
          .eq('id', backlink.id);

        results.push({
          id: backlink.id,
          source_url: backlink.source_url,
          previous_status: backlink.status,
          new_status: checkResult.status,
          is_dofollow: checkResult.is_dofollow,
          notes: checkResult.notes
        });

        // Count results
        switch (checkResult.status) {
          case 'live':
            liveCount++;
            break;
          case 'broken':
            brokenCount++;
            break;
          case 'removed':
            removedCount++;
            break;
        }

        // Small delay to avoid overwhelming target servers
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing backlink ${backlink.id}:`, error);
        results.push({
          id: backlink.id,
          source_url: backlink.source_url,
          previous_status: backlink.status,
          new_status: 'error',
          error: error.message
        });
      }
    }

    // Update metrics
    const today = new Date().toISOString().split('T')[0];
    
    // Get current counts
    const { data: currentBacklinks } = await supabase
      .from('backlinks')
      .select('status')
      .eq('status', 'live');

    const totalLiveBacklinks = currentBacklinks?.length || 0;

    await supabase
      .from('backlink_metrics')
      .upsert({
        metric_date: today,
        total_backlinks: totalLiveBacklinks,
        backlinks_lost: removedCount + brokenCount
      }, {
        onConflict: 'metric_date'
      });

    console.log(`Monitoring completed: ${results.length} backlinks checked`);
    console.log(`Results: ${liveCount} live, ${brokenCount} broken, ${removedCount} removed`);

    return new Response(JSON.stringify({
      success: true,
      checked: results.length,
      live: liveCount,
      broken: brokenCount,
      removed: removedCount,
      total_live_backlinks: totalLiveBacklinks,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in backlink monitoring:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});