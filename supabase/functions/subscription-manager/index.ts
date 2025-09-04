import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, planId, subscriptionId } = await req.json();

    switch (action) {
      case 'create_subscription': {
        const { data: subscription, error } = await supabase
          .from('user_tier_subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            start_date: new Date().toISOString(),
            billing_cycle: 'monthly'
          })
          .select()
          .single();

        if (error) throw error;

        // Initialize usage tracking
        await supabase
          .from('user_usage_tracking')
          .insert({
            user_id: userId,
            metric_type: 'daily_ai_requests',
            current_usage: 0,
            limit_value: planId === 'pro' ? 50 : planId === 'enterprise' ? -1 : 5
          });

        return new Response(JSON.stringify({ success: true, subscription }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_usage': {
        const { metricType, incrementBy = 1 } = await req.json();
        
        const { data, error } = await supabase
          .from('user_usage_tracking')
          .update({
            current_usage: supabase.raw('current_usage + ?', [incrementBy]),
            last_reset: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('metric_type', metricType)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, usage: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check_limits': {
        const { data: usage, error } = await supabase
          .from('user_usage_tracking')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        const limits = usage.reduce((acc, item) => {
          const canUse = item.limit_value === -1 || item.current_usage < item.limit_value;
          acc[item.metric_type] = {
            current: item.current_usage,
            limit: item.limit_value,
            canUse
          };
          return acc;
        }, {});

        return new Response(JSON.stringify({ success: true, limits }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Subscription manager error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});