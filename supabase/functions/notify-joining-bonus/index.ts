import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Notify Joining Bonus: Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users who received joining bonus in the last 24 hours but haven't been notified
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentBonuses, error: fetchError } = await supabase
      .from('txc_transactions')
      .select(`
        user_id,
        amount,
        created_at,
        profiles!inner(email, full_name)
      `)
      .eq('activity_type', 'joining_bonus')
      .gte('created_at', oneDayAgo)
      .is('metadata->notified', null);

    if (fetchError) {
      console.error('Error fetching bonus recipients:', fetchError);
      throw fetchError;
    }

    if (!recentBonuses || recentBonuses.length === 0) {
      console.log('No users to notify about joining bonus');
      return new Response(
        JSON.stringify({ 
          success: true,
          total_notifications: 0,
          errors: 0,
          message: 'No new users to notify'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${recentBonuses.length} users to notify`);

    let notified = 0;
    let errors = 0;

    // Send email notification to each user
    for (const bonus of recentBonuses) {
      try {
        const profile = bonus.profiles as any;
        
        // Queue email notification
        const { error: emailError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'welcome',
            recipient_email: profile.email,
            recipient_name: profile.full_name || 'User',
            template_data: {
              bonus_amount: bonus.amount,
              recipient_name: profile.full_name || 'User',
              platform_name: 'TalentXcel'
            },
            scheduled_at: new Date().toISOString(),
            status: 'pending'
          });

        if (emailError) {
          console.error(`Failed to queue email for ${profile.email}:`, emailError);
          errors++;
          continue;
        }

        // Mark as notified
        const { error: updateError } = await supabase
          .from('txc_transactions')
          .update({ 
            metadata: { notified: true, notified_at: new Date().toISOString() } 
          })
          .eq('user_id', bonus.user_id)
          .eq('activity_type', 'joining_bonus');

        if (updateError) {
          console.error(`Failed to mark as notified for user ${bonus.user_id}:`, updateError);
        }

        notified++;
        console.log(`✅ Queued notification email for ${profile.email}`);
        
      } catch (userError) {
        console.error(`Error notifying user:`, userError);
        errors++;
      }
    }

    console.log(`✅ Queued ${notified} notification emails (${errors} errors)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        total_notifications: notified,
        errors: errors,
        message: `Sent ${notified} joining bonus notifications`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in notify-joining-bonus function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        total_notifications: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
