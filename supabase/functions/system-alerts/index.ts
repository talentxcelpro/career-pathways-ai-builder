import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alertType, title, message, severity = 'medium', metadata = {} } = await req.json();

    if (!alertType || !title || !message) {
      return new Response(JSON.stringify({ error: 'Alert type, title, and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🚨 Creating system alert: ${alertType} - ${title}`);

    // Insert alert into database
    const { data: alert, error } = await supabase
      .from('system_alerts')
      .insert({
        alert_type: alertType,
        title,
        message,
        severity,
        metadata,
        is_resolved: false
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create alert:', error);
      return new Response(JSON.stringify({ error: 'Failed to create alert' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this is a critical alert that needs immediate action
    if (severity === 'critical') {
      console.error(`🔴 CRITICAL ALERT: ${title} - ${message}`);
      
      // Could add email notifications here
      // await sendCriticalAlertEmail(alert);
    }

    console.log(`✅ Alert created successfully: ${alert.id}`);

    return new Response(JSON.stringify({
      success: true,
      alert
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in system-alerts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to check system health and create alerts
async function checkSystemHealth() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check job count in last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString());

  if (jobCount < 50) {
    await supabase.from('system_alerts').insert({
      alert_type: 'low_job_count',
      title: 'Low Job Count Alert',
      message: `Only ${jobCount} jobs added in the last 24 hours`,
      severity: 'medium',
      metadata: { job_count: jobCount, period: '24h' }
    });
  }

  // Check for high duplicate rate in scraper logs
  const { data: todayLog } = await supabase
    .from('scraper_logs')
    .select('*')
    .eq('log_date', new Date().toISOString().split('T')[0])
    .single();

  if (todayLog && todayLog.total_scraped > 0) {
    const duplicateRate = (todayLog.duplicates_removed / todayLog.total_scraped) * 100;
    
    if (duplicateRate > 20) {
      await supabase.from('system_alerts').insert({
        alert_type: 'high_duplicate_rate',
        title: 'High Duplicate Rate Detected',
        message: `${duplicateRate.toFixed(1)}% duplicate jobs found today`,
        severity: 'medium',
        metadata: { duplicate_rate: duplicateRate, total_scraped: todayLog.total_scraped }
      });
    }
  }

  // Check average quality score
  const { data: qualityStats } = await supabase
    .from('job_quality_scores')
    .select('overall_score')
    .gte('created_at', yesterday.toISOString());

  if (qualityStats && qualityStats.length > 0) {
    const avgQuality = qualityStats.reduce((sum, score) => sum + score.overall_score, 0) / qualityStats.length;
    
    if (avgQuality < 6) {
      await supabase.from('system_alerts').insert({
        alert_type: 'quality_drop',
        title: 'Job Quality Drop Alert',
        message: `Average job quality score dropped to ${avgQuality.toFixed(1)}`,
        severity: 'high',
        metadata: { average_quality: avgQuality, sample_size: qualityStats.length }
      });
    }
  }
}