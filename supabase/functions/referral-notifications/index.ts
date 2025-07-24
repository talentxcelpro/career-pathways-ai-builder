import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferralNotificationRequest {
  type: 'welcome' | 'milestone' | 'reward_granted';
  referrer_id: string;
  referee_id?: string;
  milestone?: number;
  reward_data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { type, referrer_id, referee_id, milestone, reward_data }: ReferralNotificationRequest = await req.json();

    console.log('Processing referral notification:', { type, referrer_id, referee_id, milestone });

    // Get referrer profile
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', referrer_id)
      .single();

    if (!referrerProfile) {
      throw new Error('Referrer profile not found');
    }

    switch (type) {
      case 'welcome':
        if (referee_id) {
          // Get referee profile
          const { data: refereeProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', referee_id)
            .single();

          // Send notification to referrer about successful referral
          await supabase.rpc('create_notification', {
            p_user_id: referrer_id,
            p_type: 'referral_success',
            p_title: 'Friend Joined Successfully!',
            p_message: `${refereeProfile?.full_name || 'Your friend'} just joined TalentXcel using your referral link. You're one step closer to your next reward!`,
            p_module: 'referral',
            p_related_id: referee_id,
            p_link: '/refer-and-earn',
            p_priority: 'medium',
            p_icon: 'user-plus'
          });
        }
        break;

      case 'milestone':
        if (milestone) {
          const rewardMessages = {
            5: 'Congratulations! You\'ve unlocked early access to paid tools. Check your dashboard to start using premium features!',
            25: 'Amazing! You\'ve earned a 1-month Pro upgrade. Your Pro access has been activated automatically.',
            100: 'Incredible milestone! You\'ve earned 2 months of Pro membership. Enjoy all premium features!',
            300: 'Outstanding achievement! You\'ve earned 3 months of Pro membership plus exclusive benefits.',
            400: 'Legendary referrer! You\'ve unlocked 4 months of Pro membership plus bonus AI tools. You\'re in the top tier!'
          };

          const message = rewardMessages[milestone as keyof typeof rewardMessages] || `Congratulations on reaching ${milestone} referrals!`;

          await supabase.rpc('create_notification', {
            p_user_id: referrer_id,
            p_type: 'milestone_achieved',
            p_title: `🎉 Milestone Reached: ${milestone} Referrals!`,
            p_message: message,
            p_module: 'referral',
            p_related_id: null,
            p_link: '/refer-and-earn',
            p_priority: 'high',
            p_icon: 'trophy'
          });
        }
        break;

      case 'reward_granted':
        await supabase.rpc('create_notification', {
          p_user_id: referrer_id,
          p_type: 'reward_granted',
          p_title: 'Reward Granted!',
          p_message: `Your referral reward has been processed: ${reward_data?.description || 'Check your dashboard for details'}`,
          p_module: 'referral',
          p_related_id: null,
          p_link: '/refer-and-earn',
          p_priority: 'high',
          p_icon: 'gift'
        });
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Update referral analytics
    const analytics = {
      timestamp: new Date().toISOString(),
      type,
      referrer_id,
      referee_id,
      milestone,
      user_agent: req.headers.get('user-agent'),
    };

    console.log('Referral notification processed successfully:', analytics);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        analytics 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in referral-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);